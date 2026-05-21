
To build a "Chat PDF" App and following is the workflow steps. we will discuss  and complete one step at a time till we complete the code. Use python, openai key

### 🧭 GUI App Development Workflow

01. **Gather requirements**  - Define use cases, expected functionality, functional and non-functional requirements, and make initial architectural decisions.

02. **Define controller architecture(roles of):**  
   
    - MainController  
    - ComponentController  
    - DomainController  
    - Components
    - UIComposer 
    - DomainComposer  
    - AppControllers Frozen dataclass 
    - DomainControllers Frozen dataclass 

    Also define communication via signals and whether state change trigger events or not(state-driven UI updates)

03. **Design GUI pages on paper**  
    Decide how many pages/screens are needed and what each page does.

04. Each page is created with various built in widgets like buttons, labels, input type, containers etc. Group these widgets and create application(custom) components for each page.   
   
    - Identify application components needed for each GUI page.
    - Each application component will be represented by a class and have a seprate controller.  
    - UI Widgets are basic elements(Button, Input).  
    - Application components are UI units built using widgets, just like react components we make.
    - For each component create a table. one row for each widget used,  its purpose 
    - Page → Components → Data needed → Models/Classes → State

05. **Design component hierarchy**  - Decide parent/child relationships and smart vs dumb components.

06. **Skip for now :For each application component, prepare a table for variables:**  
   
    - Type: Input / Output / Static  
    - Data required for rendering  
    - Data type  
    - Group Name (help identify related variables) 

    Note : Table needs to be prepared for  application component and not for UI widgets.

07. **Derive models from component data**  
    - Domain models  : hold business data
    - State models   : hold UI state, what the app currently looks like and what mode it's in. 

08. List all user events that can occur across the app. 

09. **Define event flow for each event in a table**
    - Table columns  : No, Label, Description, Target
    - Label  examples: Update State, Update UI, Create Obj, Invoke LLM, Create Obj, read data 
    - Label names will eventually help create methods for domain controllers and component controllers. 
    - Description column : describes what that step does
    - Target column :  logical name of component, service, or state (short, survives refactoring)

10. **Identify domain controllers** 
    - Determine business logic and external service handlers.
    - create models based on what parameters are send to methods of domain controllers.
    - create models based on what is returned by methods of domain controllers.

11. **Define directory structure and a table for file responsibilities**  
    - MainController  
    - ComponentController  
    - DomainController  
    - Components
    - UIComposer(ui_composer) 
    - DomainComposer(ServiceComposer)  
    - AppControllers(ui_bundle) Frozen dataclass 
    - DomainControllers(service_bundle) Frozen dataclass  
    - Modals 
    - Othere utilities
    - Organize the application into logical folders and modules. 

12. **Identify methods of Components and Implement** 
    - For each component identify the Ui widgets and other applicaiton it needs  
    - identify the layout needed for the component.
    - methods : create widgets, createLayout  
    - Build application components based on the GUI design.

13. **Implement all models** 
	- all models of app/models/services
	- all models of app/models/state

14. **Identify methods of Component Controllers and Implement** 
    - Add one or more methods needed to handle each user(UI) event.
    - Decide : if it has method to bind component widgets to events 
    
15. **Implement ui_bundle Implement** 

16. **Identify methods of ui_composer and implement** 
    - single place where all components and component controllers are created
    - Creates MainWindow and adds all components to it with correct layout
    - Returns refrences of all component controllers as a frozen bundle

17. **Implement all files inside services/ directory** 
	- all services
	- service_bundle
	- service_composer, 

18. **Identify methods of MainController** 
    - Add one method per user event in step 9.
    - Add one method to bind Events to Handlers
    - Add methods for to  handle each error in step 9

19. Write code for rest of the files: main.py, requirements.txt, config/settings.py

---

## Smart vs Dumb Components

| | 🟣 Smart Component | 🟢 Dumb Component |
|---|---|---|
| **Owns state?** | Yes — holds and manages its own state | No — receives data from parent |
| **Qt signals** | Emits AND reacts to signals | Emits signals only (never listens) |
| **Business logic** | May contain some UI-level logic | None — only renders what it's given |
| **Talks to parent** | Yes — via signals upward | Yes — via signals upward only |
| **Reusability** | Low — tied to app context | High — works anywhere |
| **Examples in our app** | `ChatWidget`, `InputBar` | `MessageBubble`, `SendButton`, `PdfFileLabel` |
| **PyQt6 equivalent** | Widget that connects slots internally | Widget that just emits signals + paints |
| **Who decides appearance?** | Itself, based on its own state | Its parent, by passing in data |

> **Simple rule of thumb:** if a component *knows* something about the app, it's smart. If it just *shows* something it was told, it's dumb.

---

### Key Principle
> This follows a **top-down, outside-in** philosophy — design intent before implementation, which scales well for larger apps.