import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { QuestionnaireScreen } from './QuestionnaireScreen';

const noOpNavigate = () => undefined;
const saveProgress = async () => undefined;

describe('<QuestionnaireScreen />', () => {
  test('advances through option questions inside the same category screen', async () => {
    const view = await render(
      <QuestionnaireScreen
        initialDraft={{}}
        onProgressChange={saveProgress}
        onNavigate={noOpNavigate}
        requestedQuestionId={4}
        screen={12}
      />,
    );

    expect(view.getByText('Энергия и кофеин')).toBeTruthy();
    expect(view.getByText('4 / 16')).toBeTruthy();
    expect(view.getByText('Когда у вас пик энергии?')).toBeTruthy();

    await fireEvent.press(view.getByText('Вечер'));

    await waitFor(() => {
      expect(
        view.getByText('Сколько порций кофеина в день? (кофе, энергетики, крепкий чай)'),
      ).toBeTruthy();
    });
    expect(view.getByText('5 / 16')).toBeTruthy();
  });

  test('returns to the previous question inside the same category screen', async () => {
    const view = await render(
      <QuestionnaireScreen
        initialDraft={{ energyPeak: 'evening' }}
        onProgressChange={saveProgress}
        onNavigate={noOpNavigate}
        requestedQuestionId={5}
        screen={12}
      />,
    );

    await fireEvent.press(view.getByText('Назад'));

    await waitFor(() => {
      expect(view.getByText('Когда у вас пик энергии?')).toBeTruthy();
    });
    expect(view.getByText('4 / 16')).toBeTruthy();
  });

  test('shows the selected slider value before advancing', async () => {
    const view = await render(
      <QuestionnaireScreen
        initialDraft={{}}
        onProgressChange={saveProgress}
        onNavigate={noOpNavigate}
        requestedQuestionId={1}
        screen={11}
      />,
    );

    expect(view.getByText('23:00')).toBeTruthy();

    await fireEvent(view.getByRole('adjustable'), 'valueChange', 24 * 60);

    expect(view.getByText('00:00')).toBeTruthy();
    await fireEvent.press(view.getByText('Продолжить'));

    await waitFor(() => {
      expect(view.getByText('Сколько часов вы реально спите?')).toBeTruthy();
    });
    expect(view.getByText('7 ч')).toBeTruthy();
  });

  test('returns to the first missing answer instead of completing a partial draft', async () => {
    const navigate = jest.fn();
    const view = await render(
      <QuestionnaireScreen
        initialDraft={{}}
        onProgressChange={saveProgress}
        onNavigate={navigate}
        requestedQuestionId={16}
        screen={17}
      />,
    );

    await fireEvent.press(view.getByText('15'));

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith({ id: 1, screen: 11 });
    });
    expect(navigate).not.toHaveBeenCalledWith('complete');
  });

  test('keeps navigation pending until answers and cursor are persisted together', async () => {
    let finishSaving: (() => void) | undefined;
    const save = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          finishSaving = resolve;
        }),
    );
    const navigate = jest.fn();
    const pending = jest.fn();
    const view = await render(
      <QuestionnaireScreen
        initialDraft={{}}
        onNavigate={navigate}
        onPendingChange={pending}
        onProgressChange={save}
        requestedQuestionId={4}
        screen={12}
      />,
    );

    await fireEvent.press(view.getByText('Вечер'));

    expect(pending).toHaveBeenLastCalledWith(true);
    expect(save).toHaveBeenCalledWith({ energyPeak: 'evening' }, { id: 5, screen: 12 });
    expect(navigate).not.toHaveBeenCalled();

    await act(async () => {
      finishSaving?.();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith({ id: 5, screen: 12 });
      expect(pending).toHaveBeenLastCalledWith(false);
    });
  });

  test('does not start a second transition while the shared navigation lock is held', async () => {
    const save = jest.fn(async () => undefined);
    const navigate = jest.fn();
    const view = await render(
      <QuestionnaireScreen
        initialDraft={{}}
        isNavigationPending={() => true}
        onNavigate={navigate}
        onProgressChange={save}
        requestedQuestionId={4}
        screen={12}
      />,
    );

    await fireEvent.press(view.getByText('Вечер'));
    await fireEvent.press(view.getByText('Назад'));

    expect(save).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
