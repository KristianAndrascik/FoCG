## Lab 2a: Ray Tracing

[Task description](https://teaching.vda.univie.ac.at/graphics/25w/Labs/Lab2/lab2a.html)
[GitHub Repository](https://github.com/KristianAndrascik/FoCG/tree/27c8679f985339a600a1e7525113ddebf1f0435c/Lab_2a)

I was following this book: [_Ray Tracing in One Weekend_](https://raytracing.github.io/books/RayTracingInOneWeekend.html) while solving this lab. I did not copy any code from there, but I used it as a reference and guide.

## Goal:

- To develop a ray tracer.
- To understand ray tracing and implement a ray tracer!
- To create some nice color images

## Tasks:

- **T0: Set up**
    - Brainstorm and plan the implementation.
    * *Time spent*: 0h 00m
    * AI usage:
        * Used Microsoft Copilot inside VS Code for code suggestions and completions.
        * Gemini 3 Pro [chat](https://gemini.google.com/share/d1b94f607cf4) 

- **T1: Parse scene geometry from XML (spheres, planes, lights, etc.)** 
    - example1.xml
- **T2: Implement Phong illumination and shadows**
    - example2.xml
- **T3: Parse and raycast triangles (meshes read from .obj files)**
    - example3.xml
- **T4: Implement perfect specular reflection**
    - example4.xml
- **T5: Implement perfect specular refraction**
    - example5.xml
- **T6: Add texture mapping for triangles. This requires the functionality to read .png files**
    - example5.xml
- **T7: Add camera transformations**
    - example6.xml
- **T8: Implement object transformations (translation, scaling, rotation)**
    - example7.xml


## Development Phases

- **P1: The Engine Core**

    - Goal: Get pixels on screen and simple spheres.
    - Lab Task: Partial T1 (Basic Geometry).
    - Steps:
        - Follow Book Ch 2 & 3 to build your image writer and vec3 class.
            - *Time spent*: 1h 00m
        - Follow Book Ch 4 & 5 to create the Ray class and get a generic Red Sphere on the screen.
        - Follow Book Ch 6 to implement Hittable objects and Surface Normals.
        - Lab Action: Now that you have spheres, write your XML Parser (T1) to load sphere positions from a file instead of hard-coding them.

    - *Time spent*: 0h 00m
    - AI usage:
        * Used Microsoft Copilot inside VS Code for code suggestions and completions.
        * Gemini 3 Pro [chat](https://gemini.google.com/share/707b8eadcbb0)