#!/bin/bash

# ============================================================
# Quiz App - Directory Structure Generator
# ============================================================

ROOT="quiz_app"

echo "Creating quiz_app directory structure..."

# ── Root
touch $ROOT/main.py

# ── ui/pages
mkdir -p $ROOT/ui/pages/student_selection_page
touch $ROOT/ui/pages/student_selection_page/__init__.py
touch $ROOT/ui/pages/student_selection_page/student_selection_page.py
touch $ROOT/ui/pages/student_selection_page/student_selection_page_controller.py
touch $ROOT/ui/pages/student_selection_page/student_selection_page_state.py
touch $ROOT/ui/pages/student_selection_page/student_selection_page_signals.py

mkdir -p $ROOT/ui/pages/add_new_student_page
touch $ROOT/ui/pages/add_new_student_page/__init__.py
touch $ROOT/ui/pages/add_new_student_page/add_new_student_page.py
touch $ROOT/ui/pages/add_new_student_page/add_new_student_page_controller.py
touch $ROOT/ui/pages/add_new_student_page/add_new_student_page_state.py
touch $ROOT/ui/pages/add_new_student_page/add_new_student_page_signals.py

mkdir -p $ROOT/ui/pages/question_bank_selection_page
touch $ROOT/ui/pages/question_bank_selection_page/__init__.py
touch $ROOT/ui/pages/question_bank_selection_page/question_bank_selection_page.py
touch $ROOT/ui/pages/question_bank_selection_page/question_bank_selection_page_controller.py
touch $ROOT/ui/pages/question_bank_selection_page/question_bank_selection_page_state.py
touch $ROOT/ui/pages/question_bank_selection_page/question_bank_selection_page_signals.py

mkdir -p $ROOT/ui/pages/quiz_info_page
touch $ROOT/ui/pages/quiz_info_page/__init__.py
touch $ROOT/ui/pages/quiz_info_page/quiz_info_page.py
touch $ROOT/ui/pages/quiz_info_page/quiz_info_page_controller.py
touch $ROOT/ui/pages/quiz_info_page/quiz_info_page_state.py
touch $ROOT/ui/pages/quiz_info_page/quiz_info_page_signals.py

mkdir -p $ROOT/ui/pages/quiz_page
touch $ROOT/ui/pages/quiz_page/__init__.py
touch $ROOT/ui/pages/quiz_page/quiz_page.py
touch $ROOT/ui/pages/quiz_page/quiz_page_controller.py
touch $ROOT/ui/pages/quiz_page/quiz_page_state.py
touch $ROOT/ui/pages/quiz_page/quiz_page_signals.py

mkdir -p $ROOT/ui/pages/result_page
touch $ROOT/ui/pages/result_page/__init__.py
touch $ROOT/ui/pages/result_page/result_page.py
touch $ROOT/ui/pages/result_page/result_page_controller.py
touch $ROOT/ui/pages/result_page/result_page_state.py
touch $ROOT/ui/pages/result_page/result_page_signals.py

mkdir -p $ROOT/ui/pages/review_page
touch $ROOT/ui/pages/review_page/__init__.py
touch $ROOT/ui/pages/review_page/review_page.py
touch $ROOT/ui/pages/review_page/review_page_controller.py
touch $ROOT/ui/pages/review_page/review_page_state.py
touch $ROOT/ui/pages/review_page/review_page_signals.py

mkdir -p $ROOT/ui/pages/statistics_page
touch $ROOT/ui/pages/statistics_page/__init__.py
touch $ROOT/ui/pages/statistics_page/statistics_page.py
touch $ROOT/ui/pages/statistics_page/statistics_page_controller.py
touch $ROOT/ui/pages/statistics_page/statistics_page_state.py
touch $ROOT/ui/pages/statistics_page/statistics_page_signals.py

# ── ui/components/common
mkdir -p $ROOT/ui/components/common
touch $ROOT/ui/components/common/__init__.py
touch $ROOT/ui/components/common/app_header.py
touch $ROOT/ui/components/common/app_footer.py
touch $ROOT/ui/components/common/primary_button.py
touch $ROOT/ui/components/common/icon_button.py
touch $ROOT/ui/components/common/section_title.py
touch $ROOT/ui/components/common/page_container.py
touch $ROOT/ui/components/common/empty_state_widget.py

# ── ui/components/pages
mkdir -p $ROOT/ui/components/student_selection_page
touch $ROOT/ui/components/student_selection_page/__init__.py
touch $ROOT/ui/components/student_selection_page/student_grid.py
touch $ROOT/ui/components/student_selection_page/student_card.py
touch $ROOT/ui/components/student_selection_page/add_student_card.py
touch $ROOT/ui/components/student_selection_page/student_statistics_badge.py

mkdir -p $ROOT/ui/components/add_new_student_page
touch $ROOT/ui/components/add_new_student_page/__init__.py
touch $ROOT/ui/components/add_new_student_page/student_name_input.py
touch $ROOT/ui/components/add_new_student_page/avatar_selector.py
touch $ROOT/ui/components/add_new_student_page/create_student_button.py

mkdir -p $ROOT/ui/components/question_bank_selection_page
touch $ROOT/ui/components/question_bank_selection_page/__init__.py
touch $ROOT/ui/components/question_bank_selection_page/question_bank_card.py
touch $ROOT/ui/components/question_bank_selection_page/question_bank_grid.py
touch $ROOT/ui/components/question_bank_selection_page/file_picker_button.py

mkdir -p $ROOT/ui/components/quiz_info_page
touch $ROOT/ui/components/quiz_info_page/__init__.py
touch $ROOT/ui/components/quiz_info_page/quiz_metadata_panel.py
touch $ROOT/ui/components/quiz_info_page/start_quiz_button.py

mkdir -p $ROOT/ui/components/quiz_page
touch $ROOT/ui/components/quiz_page/__init__.py
touch $ROOT/ui/components/quiz_page/question_panel.py
touch $ROOT/ui/components/quiz_page/navigation_bar.py
touch $ROOT/ui/components/quiz_page/progress_bar.py
touch $ROOT/ui/components/quiz_page/flag_button.py
touch $ROOT/ui/components/quiz_page/question_number_panel.py
touch $ROOT/ui/components/quiz_page/question_number_button.py
touch $ROOT/ui/components/quiz_page/timer_widget.py

mkdir -p $ROOT/ui/components/result_page
touch $ROOT/ui/components/result_page/__init__.py
touch $ROOT/ui/components/result_page/score_summary_panel.py
touch $ROOT/ui/components/result_page/result_stats_row.py
touch $ROOT/ui/components/result_page/action_buttons_row.py

mkdir -p $ROOT/ui/components/review_page
touch $ROOT/ui/components/review_page/__init__.py
touch $ROOT/ui/components/review_page/review_question_card.py
touch $ROOT/ui/components/review_page/answer_comparison_widget.py
touch $ROOT/ui/components/review_page/review_filter_bar.py

mkdir -p $ROOT/ui/components/statistics_page
touch $ROOT/ui/components/statistics_page/__init__.py
touch $ROOT/ui/components/statistics_page/stats_summary_panel.py
touch $ROOT/ui/components/statistics_page/question_stats_row.py
touch $ROOT/ui/components/statistics_page/attempt_history_bar.py

# ── ui/question_widgets
mkdir -p $ROOT/ui/question_widgets
touch $ROOT/ui/question_widgets/__init__.py
touch $ROOT/ui/question_widgets/base_question_widget.py
touch $ROOT/ui/question_widgets/widget_factory.py
touch $ROOT/ui/question_widgets/mcq_widget.py
touch $ROOT/ui/question_widgets/true_false_widget.py
touch $ROOT/ui/question_widgets/multi_select_widget.py
touch $ROOT/ui/question_widgets/fill_in_blank_widget.py
touch $ROOT/ui/question_widgets/multi_fill_in_blank_widget.py
touch $ROOT/ui/question_widgets/options_fill_in_blank_widget.py
touch $ROOT/ui/question_widgets/table_fill_in_blank_widget.py
touch $ROOT/ui/question_widgets/table_image_fill_in_blank_widget.py
touch $ROOT/ui/question_widgets/table_image_fill_in_blank_2col_widget.py
touch $ROOT/ui/question_widgets/number_line_fill_in_blank_widget.py
touch $ROOT/ui/question_widgets/short_answer_widget.py
touch $ROOT/ui/question_widgets/matching_widget.py
touch $ROOT/ui/question_widgets/matching_drag_drop_widget.py
touch $ROOT/ui/question_widgets/matching_connection_widget.py
touch $ROOT/ui/question_widgets/matching_connection_image_widget.py
touch $ROOT/ui/question_widgets/ordering_widget.py
touch $ROOT/ui/question_widgets/ordering_horizontal_widget.py
touch $ROOT/ui/question_widgets/compare_quantities_widget.py
touch $ROOT/ui/question_widgets/image_compare_quantities_tick_widget.py
touch $ROOT/ui/question_widgets/multi_select_circle_widget.py
touch $ROOT/ui/question_widgets/multi_select_two_widget.py
touch $ROOT/ui/question_widgets/fill_in_blank_multi_graph_widget.py
touch $ROOT/ui/question_widgets/fill_in_blank_multi_graph_text_widget.py
touch $ROOT/ui/question_widgets/fill_in_blank_operation_widget.py
touch $ROOT/ui/question_widgets/number_line_arcs_widget.py
touch $ROOT/ui/question_widgets/clock_set_time_widget.py
touch $ROOT/ui/question_widgets/skip_widget.py

# ── ui/navigation
mkdir -p $ROOT/ui/navigation
touch $ROOT/ui/navigation/__init__.py
touch $ROOT/ui/navigation/page_router.py
touch $ROOT/ui/navigation/stacked_page_manager.py
touch $ROOT/ui/navigation/route_names.py

# ── ui/layouts
mkdir -p $ROOT/ui/layouts
touch $ROOT/ui/layouts/__init__.py
touch $ROOT/ui/layouts/app_layout.py
touch $ROOT/ui/layouts/page_layout.py
touch $ROOT/ui/layouts/responsive_grid_layout.py

# ── ui/themes
mkdir -p $ROOT/ui/themes
touch $ROOT/ui/themes/__init__.py
touch $ROOT/ui/themes/theme_manager.py
touch $ROOT/ui/themes/colors.py
touch $ROOT/ui/themes/fonts.py

# ── ui/__init__
touch $ROOT/ui/__init__.py

# ── question_types
mkdir -p $ROOT/question_types/base
touch $ROOT/question_types/base/__init__.py
touch $ROOT/question_types/base/base_question_model.py
touch $ROOT/question_types/base/base_parser.py
touch $ROOT/question_types/base/base_validator.py
touch $ROOT/question_types/base/base_scorer.py
touch $ROOT/question_types/base/score_result.py

mkdir -p $ROOT/question_types/registry
touch $ROOT/question_types/registry/__init__.py
touch $ROOT/question_types/registry/question_type_registry.py
touch $ROOT/question_types/registry/parser_factory.py
touch $ROOT/question_types/registry/scorer_factory.py

mkdir -p $ROOT/question_types/mcq
touch $ROOT/question_types/mcq/__init__.py
touch $ROOT/question_types/mcq/mcq_model.py
touch $ROOT/question_types/mcq/mcq_parser.py
touch $ROOT/question_types/mcq/mcq_validator.py
touch $ROOT/question_types/mcq/mcq_scorer.py

mkdir -p $ROOT/question_types/true_false
touch $ROOT/question_types/true_false/__init__.py
touch $ROOT/question_types/true_false/true_false_model.py
touch $ROOT/question_types/true_false/true_false_parser.py
touch $ROOT/question_types/true_false/true_false_validator.py
touch $ROOT/question_types/true_false/true_false_scorer.py

mkdir -p $ROOT/question_types/multi_select
touch $ROOT/question_types/multi_select/__init__.py
touch $ROOT/question_types/multi_select/multi_select_model.py
touch $ROOT/question_types/multi_select/multi_select_parser.py
touch $ROOT/question_types/multi_select/multi_select_validator.py
touch $ROOT/question_types/multi_select/multi_select_scorer.py

mkdir -p $ROOT/question_types/fill_in_blank
touch $ROOT/question_types/fill_in_blank/__init__.py
touch $ROOT/question_types/fill_in_blank/fill_in_blank_model.py
touch $ROOT/question_types/fill_in_blank/fill_in_blank_parser.py
touch $ROOT/question_types/fill_in_blank/fill_in_blank_validator.py
touch $ROOT/question_types/fill_in_blank/fill_in_blank_scorer.py

mkdir -p $ROOT/question_types/multi_fill_in_blank
touch $ROOT/question_types/multi_fill_in_blank/__init__.py
touch $ROOT/question_types/multi_fill_in_blank/multi_fill_in_blank_model.py
touch $ROOT/question_types/multi_fill_in_blank/multi_fill_in_blank_parser.py
touch $ROOT/question_types/multi_fill_in_blank/multi_fill_in_blank_validator.py
touch $ROOT/question_types/multi_fill_in_blank/multi_fill_in_blank_scorer.py

mkdir -p $ROOT/question_types/options_fill_in_blank
touch $ROOT/question_types/options_fill_in_blank/__init__.py
touch $ROOT/question_types/options_fill_in_blank/options_fill_in_blank_model.py
touch $ROOT/question_types/options_fill_in_blank/options_fill_in_blank_parser.py
touch $ROOT/question_types/options_fill_in_blank/options_fill_in_blank_validator.py
touch $ROOT/question_types/options_fill_in_blank/options_fill_in_blank_scorer.py

mkdir -p $ROOT/question_types/table_fill_in_blank
touch $ROOT/question_types/table_fill_in_blank/__init__.py
touch $ROOT/question_types/table_fill_in_blank/table_fill_in_blank_model.py
touch $ROOT/question_types/table_fill_in_blank/table_fill_in_blank_parser.py
touch $ROOT/question_types/table_fill_in_blank/table_fill_in_blank_validator.py
touch $ROOT/question_types/table_fill_in_blank/table_fill_in_blank_scorer.py

mkdir -p $ROOT/question_types/matching
touch $ROOT/question_types/matching/__init__.py
touch $ROOT/question_types/matching/matching_model.py
touch $ROOT/question_types/matching/matching_parser.py
touch $ROOT/question_types/matching/matching_validator.py
touch $ROOT/question_types/matching/matching_scorer.py

mkdir -p $ROOT/question_types/ordering
touch $ROOT/question_types/ordering/__init__.py
touch $ROOT/question_types/ordering/ordering_model.py
touch $ROOT/question_types/ordering/ordering_parser.py
touch $ROOT/question_types/ordering/ordering_validator.py
touch $ROOT/question_types/ordering/ordering_scorer.py

mkdir -p $ROOT/question_types/number_line_arcs
touch $ROOT/question_types/number_line_arcs/__init__.py
touch $ROOT/question_types/number_line_arcs/number_line_arcs_model.py
touch $ROOT/question_types/number_line_arcs/number_line_arcs_parser.py
touch $ROOT/question_types/number_line_arcs/number_line_arcs_validator.py
touch $ROOT/question_types/number_line_arcs/number_line_arcs_scorer.py

mkdir -p $ROOT/question_types/clock_set_time
touch $ROOT/question_types/clock_set_time/__init__.py
touch $ROOT/question_types/clock_set_time/clock_set_time_model.py
touch $ROOT/question_types/clock_set_time/clock_set_time_parser.py
touch $ROOT/question_types/clock_set_time/clock_set_time_validator.py
touch $ROOT/question_types/clock_set_time/clock_set_time_scorer.py

touch $ROOT/question_types/__init__.py

# ── models
mkdir -p $ROOT/models/student
touch $ROOT/models/student/__init__.py
touch $ROOT/models/student/student_profile.py
touch $ROOT/models/student/student_summary.py

mkdir -p $ROOT/models/question_bank
touch $ROOT/models/question_bank/__init__.py
touch $ROOT/models/question_bank/question_bank_model.py
touch $ROOT/models/question_bank/question_bank_metadata.py

mkdir -p $ROOT/models/statistics
touch $ROOT/models/statistics/__init__.py
touch $ROOT/models/statistics/question_stat.py
touch $ROOT/models/statistics/session_stat.py
touch $ROOT/models/statistics/student_stats.py

mkdir -p $ROOT/models/common
touch $ROOT/models/common/__init__.py
touch $ROOT/models/common/score_result.py

touch $ROOT/models/__init__.py

# ── repositories
mkdir -p $ROOT/repositories/student
touch $ROOT/repositories/student/__init__.py
touch $ROOT/repositories/student/student_repository_interface.py
touch $ROOT/repositories/student/student_json_repository.py
touch $ROOT/repositories/student/student_repository.py

mkdir -p $ROOT/repositories/question_bank
touch $ROOT/repositories/question_bank/__init__.py
touch $ROOT/repositories/question_bank/question_bank_repository_interface.py
touch $ROOT/repositories/question_bank/question_bank_json_repository.py

mkdir -p $ROOT/repositories/statistics
touch $ROOT/repositories/statistics/__init__.py
touch $ROOT/repositories/statistics/statistics_repository_interface.py
touch $ROOT/repositories/statistics/statistics_json_repository.py

mkdir -p $ROOT/repositories/quiz_session
touch $ROOT/repositories/quiz_session/__init__.py
touch $ROOT/repositories/quiz_session/quiz_session_repository_interface.py
touch $ROOT/repositories/quiz_session/quiz_session_json_repository.py

mkdir -p $ROOT/repositories/settings
touch $ROOT/repositories/settings/__init__.py
touch $ROOT/repositories/settings/settings_repository_interface.py
touch $ROOT/repositories/settings/settings_json_repository.py

touch $ROOT/repositories/__init__.py

# ── services
mkdir -p $ROOT/services/student_profile
touch $ROOT/services/student_profile/__init__.py
touch $ROOT/services/student_profile/load_students_service.py
touch $ROOT/services/student_profile/create_student_service.py
touch $ROOT/services/student_profile/delete_student_service.py

mkdir -p $ROOT/services/question_bank_loader
touch $ROOT/services/question_bank_loader/__init__.py
touch $ROOT/services/question_bank_loader/question_bank_loader_service.py
touch $ROOT/services/question_bank_loader/question_bank_validator_service.py

mkdir -p $ROOT/services/quiz_session
touch $ROOT/services/quiz_session/__init__.py
touch $ROOT/services/quiz_session/quiz_session_service.py
touch $ROOT/services/quiz_session/quiz_session_factory.py

mkdir -p $ROOT/services/statistics
touch $ROOT/services/statistics/__init__.py
touch $ROOT/services/statistics/statistics_service.py
touch $ROOT/services/statistics/statistics_calculator.py

mkdir -p $ROOT/services/autosave
touch $ROOT/services/autosave/__init__.py
touch $ROOT/services/autosave/autosave_service.py

mkdir -p $ROOT/services/settings
touch $ROOT/services/settings/__init__.py
touch $ROOT/services/settings/settings_service.py

touch $ROOT/services/__init__.py

# ── state
mkdir -p $ROOT/state
touch $ROOT/state/__init__.py
touch $ROOT/state/app_state.py
touch $ROOT/state/student_selection_state.py
touch $ROOT/state/quiz_state.py
touch $ROOT/state/quiz_session_state.py

# ── composers
mkdir -p $ROOT/composers
touch $ROOT/composers/__init__.py
touch $ROOT/composers/app_composer.py
touch $ROOT/composers/ui_composer.py
touch $ROOT/composers/service_composer.py

# ── config
mkdir -p $ROOT/config
touch $ROOT/config/__init__.py
touch $ROOT/config/app_config.py
touch $ROOT/config/paths.py

# ── resources
mkdir -p $ROOT/resources/icons
touch $ROOT/resources/icons/add.svg
touch $ROOT/resources/icons/settings.svg
touch $ROOT/resources/icons/student.svg
touch $ROOT/resources/icons/app_logo.svg
touch $ROOT/resources/icons/flag.svg
touch $ROOT/resources/icons/next.svg
touch $ROOT/resources/icons/prev.svg
touch $ROOT/resources/icons/home.svg

mkdir -p $ROOT/resources/images
touch $ROOT/resources/images/default_avatar.png

mkdir -p $ROOT/resources/fonts

mkdir -p $ROOT/resources/styles
touch $ROOT/resources/styles/student_selection_page.qss
touch $ROOT/resources/styles/quiz_page.qss
touch $ROOT/resources/styles/result_page.qss
touch $ROOT/resources/styles/common.qss

mkdir -p $ROOT/resources/svg

# ── storage
mkdir -p $ROOT/storage/students
touch $ROOT/storage/students/students.json

mkdir -p $ROOT/storage/question_banks
mkdir -p $ROOT/storage/quiz_sessions
mkdir -p $ROOT/storage/settings
mkdir -p $ROOT/storage/cache
mkdir -p $ROOT/storage/logs

# ── utils
mkdir -p $ROOT/utils
touch $ROOT/utils/__init__.py
touch $ROOT/utils/qt_utils.py
touch $ROOT/utils/file_utils.py
touch $ROOT/utils/image_utils.py
touch $ROOT/utils/svg_utils.py
touch $ROOT/utils/json_utils.py
touch $ROOT/utils/datetime_utils.py

# ── logging
mkdir -p $ROOT/logging
touch $ROOT/logging/__init__.py
touch $ROOT/logging/app_logger.py
touch $ROOT/logging/logger_factory.py
touch $ROOT/logging/log_config.py

# ── shared
mkdir -p $ROOT/shared/enums
touch $ROOT/shared/enums/__init__.py
touch $ROOT/shared/enums/page_enums.py
touch $ROOT/shared/enums/question_enums.py
touch $ROOT/shared/enums/status_enums.py

mkdir -p $ROOT/shared/validators
touch $ROOT/shared/validators/__init__.py
touch $ROOT/shared/validators/student_validator.py
touch $ROOT/shared/validators/json_schema_validator.py

mkdir -p $ROOT/shared/models
touch $ROOT/shared/models/__init__.py
touch $ROOT/shared/models/result_models.py

mkdir -p $ROOT/shared/helpers
touch $ROOT/shared/helpers/__init__.py
touch $ROOT/shared/helpers/string_helpers.py
touch $ROOT/shared/helpers/scoring_helpers.py

touch $ROOT/shared/__init__.py

# ── ui/main_window
touch $ROOT/ui/main_window.py

# ── ui/themes QSS
touch $ROOT/ui/themes/main_theme.qss

# ── tests
mkdir -p $ROOT/tests/ui
mkdir -p $ROOT/tests/question_types
mkdir -p $ROOT/tests/services
mkdir -p $ROOT/tests/repositories
mkdir -p $ROOT/tests/state
mkdir -p $ROOT/tests/event_handlers
mkdir -p $ROOT/tests/fixtures
touch $ROOT/tests/__init__.py

# ── docs
mkdir -p $ROOT/docs/architecture
mkdir -p $ROOT/docs/question_types
mkdir -p $ROOT/docs/json_formats
mkdir -p $ROOT/docs/pages
mkdir -p $ROOT/docs/diagrams

# ── keep empty storage dirs tracked by git
touch $ROOT/storage/question_banks/.gitkeep
touch $ROOT/storage/quiz_sessions/.gitkeep
touch $ROOT/storage/settings/.gitkeep
touch $ROOT/storage/cache/.gitkeep
touch $ROOT/storage/logs/.gitkeep
touch $ROOT/resources/fonts/.gitkeep
touch $ROOT/resources/svg/.gitkeep

echo ""
echo "✅ quiz_app structure created successfully."
echo "Total files created: $(find $ROOT -type f | wc -l)"
echo "Total directories created: $(find $ROOT -type d | wc -l)"