
> steps to add a new screen(result page)


```

1. page_data/result_page/
   ├── view_model.py
   └── render_data_builder.py

2. ui/components/result/
   └── result_summary_card.py

3. ui/pages/result_page/
   ├── result_page.py
   └── result_page_controller.py

4. ui/ui_page_bundle.py
5. ui/ui_composer.py

6. ui/navigation/route_names.py
7. ui/navigation/app_router_controller.py

8. app/state/app_state.py
9. app/state/app_state_controller.py

10. app/event_handlers/pages/result/
   └── restart_quiz_handler.py

11. app/event_handlers/event_handler_bundle.py
12. app/event_handlers/event_handler_composer.py

13. app/main_controller.py

14. resources/styles/ocean_blue_theme.qss


```