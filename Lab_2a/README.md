## Lab 2a: Ray Tracing

[Task description](https://teaching.vda.univie.ac.at/graphics/25w/Labs/Lab2/lab2a.html)
[GitHub Repository](https://github.com/KristianAndrascik/FoCG/tree/27c8679f985339a600a1e7525113ddebf1f0435c/Lab_2a)

I was following this book: [_Ray Tracing in One Weekend_](https://raytracing.github.io/books/RayTracingInOneWeekend.html) while solving this lab. I did not copy any code from there, but I used it as a reference and guide.

I used tinyxml2 library for XML parsing. (code by Lee Thomason (www.grinninglizard.com))

## How to build and run

g++ 7.5/cmake 3.10.2 or higher is required.

You can just run the bat file `build_run.bat` in the root folder, which will build and run the project.
Or you can run it with shell script `build_run.sh` on Linux/Mac.


## Goal:

- To develop a ray tracer.
- To understand ray tracing and implement a ray tracer!
- To create some nice color images

## Tasks:
   
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



## AI usage:
- considerations of AI usage 
    
    -  For some reason Gemini sometimes split the threads and I had to continue in a new chat. I do not know how or when it happens. Therefor some of the links may not work properly. I tried to link the main starting thread always. Also I tried to add link to any new splitted chat. I hope all of them work.
    - Also there were some problems with copilot blob links so i put just prompts as text.
    - Brainstorm and plan the implementation.  
        * Gemini 3 Pro [chat](https://gemini.google.com/share/d1b94f607cf4) 
        * Gemini 3 Pro [chat](https://gemini.google.com/share/707b8eadcbb0)
        * Gemini 3 Pro [chat](https://gemini.google.com/app/c63a390d0870a84e)
    * Used Microsoft Copilot inside VS Code for code suggestions and completions.
    * Used Gemini 3 Pro agentic chat with prompts:
            - I need a class to handle 3D points and vectors. It should support dot and cross products. Please see vec3 file and continue implementing it in the same style. 
            - Help me set up a CMake project for this. 
            - How do I output an image file from C++? Is the PPM format easier to start with than PNG?
            - I want to save my images as PNGs. I have already tried to use stmb_image_write.h but I have a special class handling it. Refactor and corectly connect it in CMake project.
            - I need to load the scene setup from an XML file. I have downloaded tinyxml2, add it to my CMake project and write a simple parser. Check how scens looks like in example.xml files.
            - No that is not working. Help me set up tinyxml2 correctly in CMake 
            - It cannot find the XML file. How do I handle file paths so they work from the build folder?
            - Format this whole file_picker acording to all scenes, edit main acordingly too
            - Add an abstract class for objects so I can store spheres and triangles in the same list. We want hittable list.
            - My sphere looks flat. How do I calculate the normal vector at the intersection point?
            - I amo adding lighting. Can you explain the Phong reflection model and help me implement it also follow the structure of mine alredy existing code. Dont write codee without explanations.
            - Can you explain how the ambient diffuse, an specular components work separately?
            - Why clamp colors?
            - How do I implement shadows? I want to check if a light source is blocked by another object.
            - Now I need to add triangles. I aleready have a class for that but I need help with the intersection code, the curent one is not working. What is best way to calculate intersection? Moller-Trumbor something?
            - add OBJ file loading functionality 
            - How can I implement mirror-like reflections? I need the formula for the reflection vector.
            - Try to debug this code why it is crashing after adding reflection rays, also add explainations?
            - I want to render glass materials. implement Snell Law 
            - You totally forgot to explain the code. Please add explanations and comments to the code for reflection and refraction.
            - There is a bug in the refraction code. We are getting NaN for some reason.
            - Ok now split this in more files 
            - We have matrix class, just rework taht 
            - I want to add textures to my objects. How can I load PNG files and map them to spheres?
            - I need a proper camera class. It should allow me to define where I am looking from and defined the look-at point.
            - How does the Field of View (FOV) affect the camera ray calculations?
            - I need to move, rotate, and scale my objects. I have prepared a matrix class for these but there are not connected in render yet connect them corectkly with explanations.
            - Do not   transform the ray, transform the object
            - The lighting on my scaled objects looks wrong. I think the normals are incorrect. How do I fix them?
            - My reflective objects look too bright and plastic-like. How should I mix the reflective color with the diffuse color?
            - The texures on my spheres are upside down. How do I roate them 180 degrees?
            - My scene takes too long to render with high-poly meshes. Is there a wy to optimize the intersetion checks?
            - What is an AABB and calculate it for a meshm explain it 
            - Edid all files where we are trying to fix shadow acne with lower values
            - Glass objcts are casting solid dark shadows, which looks wrong. Howcan i make the shadows lighter or colored


