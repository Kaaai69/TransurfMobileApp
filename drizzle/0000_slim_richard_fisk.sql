CREATE TABLE `task_log` (
	`user_task_id` text NOT NULL,
	`date` text NOT NULL,
	`status` text NOT NULL,
	`xp_awarded` integer NOT NULL,
	PRIMARY KEY(`user_task_id`, `date`),
	FOREIGN KEY (`user_task_id`) REFERENCES `user_task`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "task_log_xp_non_negative" CHECK("task_log"."xp_awarded" >= 0)
);
--> statement-breakpoint
CREATE TABLE `task_template` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`slot` text NOT NULL,
	`tier` integer,
	`anchor_text` text NOT NULL,
	`action_text` text NOT NULL,
	`subtitle` text NOT NULL,
	`source_doi` text,
	`source_citation` text,
	`source_note` text,
	`min_budget_min` integer NOT NULL,
	`stopfactor_tags` text NOT NULL,
	CONSTRAINT "task_template_tier_range" CHECK("task_template"."tier" IS NULL OR "task_template"."tier" BETWEEN 1 AND 5),
	CONSTRAINT "task_template_slot_tier_match" CHECK(("task_template"."slot" = 'core' AND "task_template"."tier" IS NOT NULL) OR ("task_template"."slot" = 'micro' AND "task_template"."tier" IS NULL)),
	CONSTRAINT "task_template_min_budget" CHECK("task_template"."min_budget_min" IN (5, 15, 30))
);
--> statement-breakpoint
CREATE TABLE `user_flags` (
	`user_id` text PRIMARY KEY NOT NULL,
	`food_soft_mode` integer NOT NULL,
	`budget_minutes` integer NOT NULL,
	`stopfactor_type` text,
	`stopfactor_value` text,
	CONSTRAINT "user_flags_budget_minutes" CHECK("user_flags"."budget_minutes" > 0),
	CONSTRAINT "user_flags_stopfactor_pair" CHECK(("user_flags"."stopfactor_type" IS NULL AND "user_flags"."stopfactor_value" IS NULL) OR ("user_flags"."stopfactor_type" IS NOT NULL AND "user_flags"."stopfactor_value" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE `user_state` (
	`user_id` text PRIMARY KEY NOT NULL,
	`sleep` integer NOT NULL,
	`energy` integer NOT NULL,
	`movement` integer NOT NULL,
	`food` integer NOT NULL,
	`water` integer NOT NULL,
	`mind` integer NOT NULL,
	`baseline_sleep` integer NOT NULL,
	`baseline_energy` integer NOT NULL,
	`baseline_movement` integer NOT NULL,
	`baseline_food` integer NOT NULL,
	`baseline_water` integer NOT NULL,
	`baseline_mind` integer NOT NULL,
	`recalculated_at` text NOT NULL,
	`level_xp` integer NOT NULL,
	`grace_days_left` integer NOT NULL,
	`grace_window_start` text NOT NULL,
	CONSTRAINT "user_state_values_range" CHECK("user_state"."sleep" BETWEEN 0 AND 100 AND "user_state"."energy" BETWEEN 0 AND 100 AND "user_state"."movement" BETWEEN 0 AND 100 AND "user_state"."food" BETWEEN 0 AND 100 AND "user_state"."water" BETWEEN 0 AND 100 AND "user_state"."mind" BETWEEN 0 AND 100 AND "user_state"."baseline_sleep" BETWEEN 0 AND 100 AND "user_state"."baseline_energy" BETWEEN 0 AND 100 AND "user_state"."baseline_movement" BETWEEN 0 AND 100 AND "user_state"."baseline_food" BETWEEN 0 AND 100 AND "user_state"."baseline_water" BETWEEN 0 AND 100 AND "user_state"."baseline_mind" BETWEEN 0 AND 100),
	CONSTRAINT "user_state_level_xp_non_negative" CHECK("user_state"."level_xp" >= 0),
	CONSTRAINT "user_state_grace_days_range" CHECK("user_state"."grace_days_left" BETWEEN 0 AND 2)
);
--> statement-breakpoint
CREATE TABLE `user_task` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`template_id` text,
	`slot` text NOT NULL,
	`custom_anchor` text,
	`custom_action` text,
	`category` text NOT NULL,
	`started_at` text NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`template_id`) REFERENCES `task_template`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "user_task_template_or_custom" CHECK(("user_task"."slot" = 'custom' AND "user_task"."template_id" IS NULL AND "user_task"."custom_anchor" IS NOT NULL AND "user_task"."custom_action" IS NOT NULL) OR ("user_task"."slot" <> 'custom' AND "user_task"."template_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE TRIGGER `user_state_level_xp_monotonic`
BEFORE UPDATE OF `level_xp` ON `user_state`
WHEN NEW.`level_xp` < OLD.`level_xp`
BEGIN
	SELECT RAISE(ABORT, 'level_xp cannot decrease');
END;
