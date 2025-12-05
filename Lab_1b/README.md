## Lab 1b: Recreating aspects from game PacMania.

[Task description](https://teaching.vda.univie.ac.at/graphics/25w/Labs/Lab1/lab1b.html)
[GitHub Repository](https://github.com/KristianAndrascik/FoCG/tree/27c8679f985339a600a1e7525113ddebf1f0435c/Lab_1b)

## Goal:

The goal of this lab is recreating aspects from the classic game PacMania. This includes implementing a 3D maze, animated Pacman.

## Tasks:

### T0: Set up a basic WebGL program

* I took the existing codebase from Lab 1a as a starting point. Cleaned up unnecessary parts and prepared the project structure for the new requirements. Prepared the plan for implementing, tasks.

* *Time spent*: 0h 45m
* AI usage:
  * None

### T1: FOUNDATIONS 

#### T1.1: 3D Maze - Labyrinth

* not too sophisticated, but also not too simple
* ground plane


* *Time spent*: 0h 45m
* AI usage:

  * Used Microsoft Copilot inside VS Code for code suggestions and completions.
  * Used GitHub Copilot (VS Code) - model Gemini 3 Pro (Preview) - agent mode. Prompts: 
    - "add ground plane"
    - "lets strutcure the code better, move this to more dedecated place."
    - "We cannot see te ground plane, normals are important add them to other directions as well"
    - "edit wind size to utilitize full screen as well"
    - "Prepare basic building box for maze, it should be box ... one in every dimension and on top of it pyramide with high one as well."
    - "change it a litttle bit. hight of box is 0.25 and hight of pyramide 0.75"
    - "now lats create a simple parser for simple puzzles. This should load a puzzle form input file and then in app we will recreate this from our basic building blocks"
    - "great, create more levels"
    - 

  * ChatGPT-5 [chat](https://chatgpt.com/c/6913172a-f978-832c-884f-45a5588e7108)
  

#### T1.2: Pacman Model

* yellow ball that can be moved around on top of that plane
* no object-intersection
* Phong shading

* *Time spent*: 0h 00m
* AI usage:

  * Used Microsoft Copilot inside VS Code for code suggestions and completions.
  * ChatGPT-5 [chat](https://chatgpt.com/c/6913172a-f978-832c-884f-45a5588e7108)


#### T1.3: Animatate Pacman

* mouth opening and closing while moving
* add eye spheres ... moving as well

* *Time spent*: 0h 00m  
* AI usage:

  * Used Microsoft Copilot inside VS Code for code suggestions and completions.
  * Gemini 3 Pro [chat](https://gemini.google.com/app?android-min-version=301356232&ios-min-version=322.0&is_sa=1&campaign_id=test_autosubmit&pt=9008&mt=8&_gl=1*vs02q3*_gcl_au*MjcxODY1NzE3LjE3NjQwODQxNjM.)


### T2: GRAPHICAL ASPECTS

#### T2.1: Shear-view

* change camera to shear-view pressing a *v* key

* *Time spent*: 0h 30m
* AI usage:

  * Used Microsoft Copilot inside VS Code for code suggestions and completions.
  * Used GitHub Copilot (VS Code) - model Gemini 3 Pro (Preview) - agent mode. Prompts: 
    - "Create a shear-view that can be toggled. Pressing the "v"-button should toggle between the shear view and the 3D view from the same camera position."
    - "When talking about shear view we want oblique projection and not only applied shear"
    - "We need to adjust the lookAt point as well, so that we are looking slighlty downwards form our position."
    - "But now logiclly when we toggle back to perspective view we want to look at the original lookAt point, calculate offset and apply" 


#### T2.2: Shadows

* *Time spent*: 0h 00m
* AI usage:

  * Used Microsoft Copilot inside VS Code for code suggestions and completions.
  * ChatGPT-5 [chat](https://chatgpt.com/c/WEB:ec6419db-7bab-4035-b312-081c05fc3c05)

### T3: GAMING ASPECTS

* *Time spent*: 0h 00m
* AI usage:

  * Used GitHub Copilot (VS Code) - model Cluade Sonnet 4.5 for implementing the interactive control system.
  * Initial Prompt: "Now lets make it interactive. and explain T3: Add user interaction Extend your program to support interactive control of both shapes and lights using the keyboard and mouse. The following features must be implemented: \[full T3 specification provided]"
    -AI Implementation: Copilot generated the complete State management system, Keymap handler with all keyboard controls (model selection 0-9, shading modes r/t, transformation controls for shapes/lights/camera), mouse drag interaction for camera translation, coordinate axes visualization system with RGB color coding, and shader switching infrastructure. The AI created 4 new files (State.js, Keymap.js, CoordinateAxes.js, axes shaders) and integrated everything into the existing App.js and Scene.js architecture.
  * Lots of debugging

### T4: AVDVANCED GAMING ASPECTS

* I wasn't able to complete this task. ... This version therefore includes only working part up to T3.
* *Time spent*: 0h 00m
* AI usage:

  * Used Microsoft Copilot inside VS Code for code suggestions and completions.
