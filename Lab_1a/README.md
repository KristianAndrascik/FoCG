## Lab 1a: Interactive 3D Objects with lighting

[Task description](https://teaching.vda.univie.ac.at/graphics/25w/Labs/Lab1/lab1a.html)
[GitHub Repository](https://github.com/KristianAndrascik/FoCG/tree/27c8679f985339a600a1e7525113ddebf1f0435c/Lab_1a)

## Goal:

The goal of this lab is to create a simple, interactive 3D application that incorporates both geometry and lighting. The focus is on the development of a graphics program and how to handle geometry, rotation, translation, user interaction, surface properties, and shading/illumination models. Most of the concepts are laid out in the book as well as discussed in class with example programs.

## Tasks:

### T0: Set up a basic WebGL program

* *Time spent*: 3h 30m
* AI usage:

  * Used Microsoft Copilot inside VS Code for code suggestions and completions.
  * ChatGPT-5 [chat](https://chatgpt.com/c/690dd4ce-fc50-832a-8224-4e2e690de61d)

### T1: Camera position and 3D-shapes

* *Time spent*: 2h 30m
* AI usage:

  * Used Microsoft Copilot inside VS Code for code suggestions and completions.
  * ChatGPT-5 [chat](https://chatgpt.com/c/6913172a-f978-832c-884f-45a5588e7108)
  *  

### T2: Shading

* *Time spent*: 2h 30m
* AI usage:

  * Used Microsoft Copilot inside VS Code for code suggestions and completions.
  * ChatGPT-5 [chat](https://chatgpt.com/c/WEB:ec6419db-7bab-4035-b312-081c05fc3c05)

### T3: User interaction

* *Time spent*: 1h 30m
* AI usage:

  * Used GitHub Copilot (VS Code) - model Cluade Sonnet 4.5 for implementing the interactive control system.
  * Initial Prompt: "Now lets make it interactive. and explain T3: Add user interaction Extend your program to support interactive control of both shapes and lights using the keyboard and mouse. The following features must be implemented: \[full T3 specification provided]"
    -AI Implementation: Copilot generated the complete State management system, Keymap handler with all keyboard controls (model selection 0-9, shading modes r/t, transformation controls for shapes/lights/camera), mouse drag interaction for camera translation, coordinate axes visualization system with RGB color coding, and shader switching infrastructure. The AI created 4 new files (State.js, Keymap.js, CoordinateAxes.js, axes shaders) and integrated everything into the existing App.js and Scene.js architecture.
  * Lots of debugging

### T4: Shadows

* I wasn't able to complete this task. ... This version therefore includes only working part up to T3.
* *Time spent*: 2h 00m
* AI usage:

  * Used Microsoft Copilot inside VS Code for code suggestions and completions.
