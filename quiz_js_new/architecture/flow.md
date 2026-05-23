
# MPA Quiz app

```

home.html
  selects quiz JSON
  writes quizData to sessionStorage
  redirects to quiz.html

quiz.html
  reads quizData from sessionStorage
  runs quiz
  writes quizResult to sessionStorage
  redirects to result.html

result.html
  reads quizResult from sessionStorage
  shows result

```

---

# MPA fits perfectly here:

- No router needed.
- No global AppState needed. No shared DOM state between pages
- Pages are truly independent.
- file:/// support is easier. no server, no router needed
- Browser refresh still works.
- Each page owns its own controller.
- Each page loads only what it needs
- Debugging is simpler.
- Session storage is the communication layer. SessionStorage handles the only data passing needed.
- Pages communicate only through sessionStorage.
- Easier to debug — open any page independently

# SPA would be overkill here:

- Router adds complexity with zero benefit for a 3-page linear flow.
- Shared state management becomes unnecessary complexity
- All page scripts load upfront even when not needed
- Harder to isolate and test individual pages


