#!/bin/bash

# ==========================================
# Quiz App Directory Structure Creator
# ==========================================

mkdir -p quiz_app

cd quiz_app || exit

# =====================================================
# UI
# =====================================================

mkdir -p ui/pages/student_selection_page
mkdir -p ui/components/common
mkdir -p ui/components/student_selection_page
mkdir -p ui/navigation
mkdir -p ui/layouts
mkdir -p ui/themes

touch ui/main_window.py

touch ui/pages/student_selection_page/student_selection_page.py
touch ui/pages/student_selection_page/student_selection_page_controller.py
touch ui/pages/student_selection_page/student_selection_page_state.py
touch ui/pages/student_selection_page/student_selection_page_signals.py

touch ui/components/common/app_header.py
touch ui/components/common/app_footer.py
touch ui/components/common/primary_button.py
touch ui/components/common/icon_button.py
touch ui/components/common/section_title.py
touch ui/components/common/page_container.py
touch ui/components/common/empty_state_widget.py

touch ui/components/student_selection_page/student_grid.py
touch ui/components/student_selection_page/student_card.py
touch ui/components/student_selection_page/add_student_card.py
touch ui/components/student_selection_page/student_statistics_badge.py

touch ui/navigation/page_router.py
touch ui/navigation/stacked_page_manager.py
touch ui/navigation/route_names.py

touch ui/layouts/app_layout.py
touch ui/layouts/page_layout.py
touch ui/layouts/responsive_grid_layout.py

touch ui/themes/theme_manager.py
touch ui/themes/colors.py
touch ui/themes/fonts.py
touch ui/themes/main_theme.qss

# =====================================================
# MODELS
# =====================================================

mkdir -p models/student

touch models/student/student_profile.py
touch models/student/student_summary.py

# =====================================================
# REPOSITORIES
# =====================================================

mkdir -p repositories/student

touch repositories/student/student_repository.py
touch repositories/student/student_json_repository.py
touch repositories/student/student_repository_interface.py

# =====================================================
# SERVICES
# =====================================================

mkdir -p services/student_profile

touch services/student_profile/load_students_service.py
touch services/student_profile/create_student_service.py

# =====================================================
# STATE
# =====================================================

mkdir -p state

touch state/app_state.py
touch state/student_selection_state.py

# =====================================================
# COMPOSERS
# =====================================================

mkdir -p composers

touch composers/ui_composer.py
touch composers/service_composer.py
touch composers/app_composer.py

# =====================================================
# RESOURCES
# =====================================================

mkdir -p resources/icons
mkdir -p resources/images
mkdir -p resources/styles

touch resources/icons/add.svg
touch resources/icons/settings.svg
touch resources/icons/student.svg
touch resources/icons/app_logo.svg

touch resources/images/default_avatar.png

touch resources/styles/student_selection_page.qss

# =====================================================
# STORAGE
# =====================================================

mkdir -p storage/students

touch storage/students/students.json

# =====================================================
# CONFIG
# =====================================================

mkdir -p config

touch config/app_config.py
touch config/paths.py

# =====================================================
# UTILS
# =====================================================

mkdir -p utils

touch utils/qt_utils.py
touch utils/file_utils.py
touch utils/image_utils.py

# =====================================================
# LOGGING
# =====================================================

mkdir -p logging

touch logging/app_logger.py
touch logging/logger_factory.py

# =====================================================
# SHARED
# =====================================================

mkdir -p shared/enums
mkdir -p shared/validators

touch shared/enums/page_enums.py
touch shared/validators/student_validator.py

# =====================================================
# ROOT FILES
# =====================================================

touch main.py

echo "=========================================="
echo "Quiz App directory structure created."
echo "=========================================="