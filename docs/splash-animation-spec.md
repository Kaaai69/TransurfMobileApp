# Анимация «Линия становится кольцом»

Документ 9. Спецификация для разработки: тайминги, параметры, готовый код.

---

## Оглавление

1. [Почему не генеративное видео](#часть-1--почему-не-генеративное-видео)
2. [Идея: 60 сегментов](#часть-2--идея-60-сегментов)
3. [Партитура анимации](#часть-3--партитура)
4. [Веб-прототип](#часть-4--веб-прототип)
5. [SwiftUI](#часть-5--swiftui)
6. [Android](#часть-6--android)
7. [Rive как альтернатива](#часть-7--rive)
8. [Где Flow и Nano Banana действительно нужны](#часть-8--где-flow-и-nano-banana-нужны)
9. [Проверки](#часть-9--проверки)

---

# ЧАСТЬ 1 — Почему не генеративное видео

Google Flow (Veo) и Nano Banana — сильные инструменты, но эта задача не их.

| Требование | Генеративное видео | Код |
|---|---|---|
| Точная геометрия окружности | нет, ведёт и подрагивает | да |
| Тайминг по кадрам | не контролируется | да |
| Альфа-канал | нет, фон вплавлен | да |
| Бесшовный цикл | практически нет | да |
| Вес | мегабайты | < 2 КБ |
| Реакция на данные | невозможно | да |
| Правка цвета после сдачи | перегенерация | одна константа |

Последняя строка решающая. Это же кольцо потом рисуется из шести значений категорий и прирастает на дугу в день. Такое должно быть параметрическим объектом, а не роликом.

**Тест, который стоит запомнить.** Если объект должен реагировать на данные пользователя — это код. Если объект неизменен и служит фоном или атмосферой — можно генерировать.

---

# ЧАСТЬ 2 — Идея: 60 сегментов

Кольцо состоит не из сплошной линии, а из **60 дуг по 6°** — по одной на каждый день ядра.

В начале анимации каждая дуга прочерчена на 35% своего сектора: получается штриховая линия с разрывами. К концу каждая дуга дорастает до 100%, разрывы закрываются, кольцо становится непрерывным.

**Что это даёт:**

1. Заставка буквально показывает механику продукта: шестьдесят дней, смыкающихся в непрерывную линию.
2. Заставка и кольцо привычки на главном экране — **один объект с разными параметрами**, а не две похожие графики. Система не распадается.
3. Прощённый день на главном экране — это тот же сегмент, просто с меньшей толщиной. Ничего нового рисовать не нужно.

**Два параметра управляют всем:**

```
fill   0.35 → 1.0    насколько заполнен каждый сегмент (разрывы)
openY  0.02 → 1.0    вертикальное сжатие (прямая → кольцо)
```

При `openY = 0.02` окружность выглядит горизонтальной линией. При `1.0` — полноценным кольцом. Промежуточные значения дают раскрытие.

**Важно:** сжатие делается трансформацией **пути**, а не слоя. Тогда обводка остаётся равномерной. Если сжимать готовый отрисованный слой, линия сплющится и станет разной толщины сверху и по бокам.

---

# ЧАСТЬ 3 — Партитура

## Заставка при запуске — 1500 мс

Видят каждый день. Должна быть короткой и не надоесть на трёхсотый раз.

| Время | Что происходит | Значения |
|---|---|---|
| 0–150 мс | появление плоской штриховой линии | opacity 0 → 0.45, `openY` 0.02, `fill` 0.35 |
| 150–850 мс | линия разворачивается в кольцо | `openY` 0.02 → 1.0 |
| 450–1100 мс | разрывы закрываются | `fill` 0.35 → 1.0, цвет `#2A3AA8` → `#4361FF` |
| 900–1300 мс | загорается свечение | opacity 0 → 0.5 |
| 1300–1500 мс | передача управления приложению | кольцо остаётся, экран проявляется поверх |

**Кривая:** `cubic-bezier(0.16, 1, 0.3, 1)` для раскрытия и закрытия разрывов. Свечение — `ease-out`.

**Кольцо не исчезает.** На 1300 мс поверх него проявляется главный экран, а само кольцо уезжает на своё место в интерфейсе. Заставка переходит в приложение, а не сменяется им — это дешёвый приём, который сильно повышает ощущение цельности.

## Приветственный экран онбординга — 3400 мс до первой строки

Видят один раз. Можно медленнее и торжественнее.

| Время | Что происходит |
|---|---|
| 0–500 мс | появление плоской линии |
| 500–2200 мс | раскрытие в кольцо |
| 1600–3200 мс | закрытие разрывов, смена цвета |
| 2600–3400 мс | свечение |
| 3400 мс+ | построчное появление текста, 400 мс на строку |
| 4000 мс | появляется кнопка «Дальше» |

Кнопка появляется **раньше окончания текста** — никого не удерживаем.

## Общие правила

- Ничего не пульсирует и не дышит после завершения.
- Отскоков и пружин нет.
- При `prefers-reduced-motion` анимация не проигрывается: сразу показывается финальное состояние.
- На повторных запусках в тот же день заставка сокращается до 600 мс — только проявление финального состояния.

---

# ЧАСТЬ 4 — Веб-прототип

Открыть на телефоне и потрогать до того, как отдавать в разработку. Один файл, никаких зависимостей.

```html
<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  html,body{margin:0;height:100%;background:#000;display:grid;place-items:center;}
  svg{width:min(70vw,320px);}
  .seg{fill:none;stroke-width:3.5;stroke-linecap:round;}
</style></head><body>
<svg id="s" viewBox="-120 -120 240 240"></svg>
<script>
const NS='http://www.w3.org/2000/svg', N=60, R=95, svg=document.getElementById('s');
const glow=document.createElementNS(NS,'g'), main=document.createElementNS(NS,'g');
glow.setAttribute('filter','url(#b)'); glow.setAttribute('opacity','0');

const defs=document.createElementNS(NS,'defs');
defs.innerHTML='<filter id="b" x="-60%" y="-60%" width="220%" height="220%">'+
               '<feGaussianBlur stdDeviation="10"/></filter>';
svg.append(defs,glow,main);

const P=(a)=>[R*Math.cos(a), R*Math.sin(a)];
function arc(i,fill){
  const step=2*Math.PI/N, s=i*step-Math.PI/2, e=s+step*fill;
  const [x1,y1]=P(s), [x2,y2]=P(e);
  return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${R} ${R} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}
const segs=[], gsegs=[];
for(let i=0;i<N;i++){
  const a=document.createElementNS(NS,'path'); a.setAttribute('class','seg'); main.append(a); segs.push(a);
  const g=document.createElementNS(NS,'path'); g.setAttribute('class','seg');
  g.setAttribute('stroke','#4361FF'); g.setAttribute('stroke-width','9'); glow.append(g); gsegs.push(g);
}

const ease=t=>1-Math.pow(1-t,4);
const span=(t,a,b)=>Math.max(0,Math.min(1,(t-a)/(b-a)));
const lerp=(a,b,t)=>a+(b-a)*t;
const mix=(c1,c2,t)=>{const h=c=>[1,3,5].map(i=>parseInt(c.substr(i,2),16));
  const [a,b]=[h(c1),h(c2)];
  return '#'+a.map((v,i)=>Math.round(lerp(v,b[i],t)).toString(16).padStart(2,'0')).join('');};

const DUR=1500;
function frame(t0){
  return function step(now){
    const t=Math.min(1,(now-t0)/DUR);
    const openY=lerp(0.02,1,ease(span(t,0.10,0.57)));
    const fill =lerp(0.35,1,ease(span(t,0.30,0.73)));
    const col  =mix('#2A3AA8','#4361FF',span(t,0.30,0.73));
    const op   =lerp(0,1,span(t,0,0.10));

    main.setAttribute('transform',`scale(1 ${openY.toFixed(4)})`);
    glow.setAttribute('transform',`scale(1 ${openY.toFixed(4)})`);
    main.setAttribute('opacity',Math.max(op,0.45));
    glow.setAttribute('opacity',(0.5*span(t,0.60,0.87)).toFixed(3));

    for(let i=0;i<N;i++){ const d=arc(i,fill); segs[i].setAttribute('d',d);
      segs[i].setAttribute('stroke',col); gsegs[i].setAttribute('d',d); }
    if(t<1) requestAnimationFrame(step);
  };
}
if(matchMedia('(prefers-reduced-motion: reduce)').matches){
  main.setAttribute('transform','scale(1 1)'); main.setAttribute('opacity','1');
  for(let i=0;i<N;i++){segs[i].setAttribute('d',arc(i,1)); segs[i].setAttribute('stroke','#4361FF');}
} else { requestAnimationFrame(n=>requestAnimationFrame(frame(n))); }
</script></body></html>
```

Сохранить как `ring.html`, открыть на телефоне. Меняйте `DUR`, `N`, `R` и границы в `span()` — весь тюнинг там.

---

# ЧАСТЬ 5 — SwiftUI

Ключевой момент: сжатие применяется к **пути** через `CGAffineTransform`, а не к слою через `scaleEffect`. Иначе обводка сплющится.

```swift
import SwiftUI

struct SegmentedRing: Shape {
    var fill: CGFloat      // 0.35 → 1.0
    var openY: CGFloat     // 0.02 → 1.0
    private let count = 60

    var animatableData: AnimatablePair<CGFloat, CGFloat> {
        get { .init(fill, openY) }
        set { fill = newValue.first; openY = newValue.second }
    }

    func path(in rect: CGRect) -> Path {
        let c = CGPoint(x: rect.midX, y: rect.midY)
        let r = min(rect.width, rect.height) / 2
        let step = 360.0 / Double(count)

        var p = Path()
        for i in 0..<count {
            let start = Angle.degrees(Double(i) * step - 90)
            let end   = Angle.degrees(Double(i) * step - 90 + step * Double(fill))
            p.move(to: CGPoint(x: c.x + r * cos(start.radians),
                               y: c.y + r * sin(start.radians)))
            p.addArc(center: c, radius: r,
                     startAngle: start, endAngle: end, clockwise: false)
        }
        // сжатие пути — обводка остаётся равномерной
        return p.applying(
            CGAffineTransform(translationX: 0, y: c.y)
                .scaledBy(x: 1, y: openY)
                .translatedBy(x: 0, y: -c.y)
        )
    }
}

struct SplashRing: View {
    @State private var fill: CGFloat  = 0.35
    @State private var openY: CGFloat = 0.02
    @State private var glow: Double   = 0
    @State private var body_: Double  = 0.45

    private let accent = Color(red: 0.263, green: 0.380, blue: 1.0)   // #4361FF
    private let deep   = Color(red: 0.165, green: 0.227, blue: 0.659) // #2A3AA8

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            SegmentedRing(fill: fill, openY: openY)
                .stroke(accent, style: .init(lineWidth: 9, lineCap: .round))
                .blur(radius: 12)
                .opacity(glow)

            SegmentedRing(fill: fill, openY: openY)
                .stroke(fill > 0.6 ? accent : deep,
                        style: .init(lineWidth: 3.5, lineCap: .round))
                .opacity(body_)
        }
        .frame(width: 190, height: 190)
        .onAppear(perform: run)
    }

    private func run() {
        let curve = Animation.timingCurve(0.16, 1, 0.3, 1, duration: 0.70)

        withAnimation(.easeOut(duration: 0.15)) { body_ = 1 }

        withAnimation(curve.delay(0.15)) { openY = 1 }

        withAnimation(.timingCurve(0.16, 1, 0.3, 1, duration: 0.65).delay(0.45)) {
            fill = 1
        }
        withAnimation(.easeOut(duration: 0.40).delay(0.90)) { glow = 0.5 }
    }
}
```

**Уважение к системной настройке:**

```swift
@Environment(\.accessibilityReduceMotion) private var reduceMotion
// в run(): if reduceMotion { fill = 1; openY = 1; glow = 0.5; body_ = 1; return }
```

---

# ЧАСТЬ 6 — Android

Та же математика на `Canvas` в Compose. Ключевое отличие: сжатие через `scale(scaleX = 1f, scaleY = openY, pivot = center)` вокруг `drawArc`, применённое к рисованию пути, — обводка при этом считается после трансформации, что нам и нужно.

```kotlin
Canvas(Modifier.size(190.dp)) {
    val r = size.minDimension / 2
    val c = center
    scale(scaleX = 1f, scaleY = openY, pivot = c) {
        repeat(60) { i ->
            val start = i * 6f - 90f
            drawArc(
                color = if (fill > 0.6f) accent else deep,
                startAngle = start,
                sweepAngle = 6f * fill,
                useCenter = false,
                topLeft = Offset(c.x - r, c.y - r),
                size = Size(r * 2, r * 2),
                style = Stroke(width = 3.5.dp.toPx(), cap = StrokeCap.Round)
            )
        }
    }
}
```

`fill` и `openY` — через `animateFloatAsState` с `CubicBezierEasing(0.16f, 1f, 0.3f, 1f)`.

---

# ЧАСТЬ 7 — Rive

Если хотите править анимацию без разработчика — соберите её в Rive: один файл на обе платформы, интерактивные состояния, малый вес.

**Стоит брать, если:**
- анимацию будут часто перебирать и подкручивать;
- планируются более сложные сцены (замыкание на 60-й день, празднование);
- дизайнер должен работать сам.

**Не стоит, если:** это единственная анимация в приложении. Тогда рантайм Rive — лишняя зависимость ради тридцати строк кода.

**Lottie** — вариант, если в команде есть After Effects. Минус: тяжелее Rive и хуже с интерактивными состояниями.

---

# ЧАСТЬ 8 — Где Flow и Nano Banana нужны

Инструменты сильные, просто не для векторной анимации. Их зона:

| Задача | Инструмент |
|---|---|
| **Превью-видео для App Store** (до 30 сек) | Flow — монтаж, атмосферные вставки, титры |
| Ключевой арт: кольцо со светом крупно | Nano Banana Pro, 2K/4K |
| Иконка приложения — перебор вариантов | Nano Banana Pro, десятки за час |
| Фоны для скриншотов в сторе | Nano Banana Pro |
| Атмосферные ролики для промо-сайта | Flow |
| Мудборды для выбора направления | Nano Banana Pro |

**Важно про превью в сторе.** Скриншоты и видео там должны показывать **реальный интерфейс** — Apple отклоняет превью, где показано не то, что в приложении. Генеративные кадры годятся как подложка и как перебивки, но сами экраны — только настоящие.

**SynthID.** Все изображения Google несут невидимый водяной знак. Для мудбордов неважно; в финальных ассетах лучше иметь свои файлы.

---

# ЧАСТЬ 9 — Проверки

1. **На устройстве в темноте.** Свечение не должно слепить в 23:00 при минимальной яркости.
2. **Триста раз подряд.** Откройте приложение двадцать раз кряду. Если начало раздражать — сокращайте до 900 мс.
3. **Reduce Motion.** При включённой системной настройке анимации нет, сразу финальное состояние.
4. **Холодный старт.** Анимация не должна задерживать готовое приложение. Если данные загрузились за 400 мс — обрывайте на 600 мс, а не ждите полутора секунд.
5. **Обводка.** На раскрытии линия должна быть равномерной толщины сверху и по бокам. Разная толщина = сжали слой вместо пути.
6. **60 сегментов на маленьком радиусе.** В виджете при радиусе 22 px шестьдесят сегментов сольются в кашу — там берите 12 сегментов или сплошную дугу.
