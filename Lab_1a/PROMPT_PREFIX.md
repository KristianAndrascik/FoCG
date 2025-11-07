I'm currently trying to learn and deeply understand basic concept of Computer graphics. I'm not just looking for a quick answer or a final solution; my main goal is to grasp the underlying mechanisms and intuition behind it.

Please treat this conversation as a learning journey. Feel free to challenge my assumptions, ask me to explain my reasoning, or suggest alternative ways of thinking about the problem. If you can help me build a solid foundation rather than just patching holes, that would be fantastic.

Now the project specification for more context>

This is the final goal> The goal of this lab is to create a simple, interactive 3D application that incorporates both geometry and lighting. The focus is on the development of a graphics program and how to handle geometry, rotation, translation, user interaction, surface properties, and shading/illumination models. Most of the concepts are laid out in the book as well as discussed in class with example programs.

This are the tasks>

Set up a basic WebGL program, which initializes the drawing window.

T1: Camera position and 3D-shapes (25%)
Create a scene with 9 3D shapes which can be seen from the camera.

The camera must initially lie on the positive z-axis and is in the beginning not allowed to be in the global center (0,0,0).
All shapes must be loaded from .obj files (we provide some). For example, these models. In order to correctly parse and use these models you will have to learn about the OBJ file format.
You need at least two different types of shapes!
You must write your own .obj parser to read the geometry data. The parser should handle at least vertices, faces, and normals.
T2: Shading (20%)
Implement Phong shading (pixel shading) using a point light source initialized at coordinates (0, 10, 0). Your implementation must include both components of the Phong illumination model:

(10%) Shade the models - Phong/diffuse Implement Phong shading (pixel shading) with diffuse illumination.

(10%) Shade the models - Phong/specular Implement Phong shading (pixel shading) with the Phong illumination model to produce a specular highlight.

T3: Add user interaction (35%)
Extend your program to support interactive control of both shapes and lights using the keyboard and mouse. The following features must be implemented:


a) Model and Lighting Selection (10%)
Shading model selection:
Press r to activate Phong shading with diffuse illumination
Press t to activate Phong shading with specular illumination
Model selection
The user should be able to select the active shape by pressing the number keys between '1' and '9'. Show the highlighted shape by displaying its local coordinate system overlaid on it. Only the selected shape should move when performing transformations, the transformations should apply to the local coordinate system of the shape.
Pressing the '0' key should select all shapes and transformation should apply relative to the center of the global coordinate system. Please also draw the global coordinate system. (Hint: the global CS should remain stationary.)
b) Light interation (5%)
Press L to toggle between interacting with shapes and interacting with the light.
Rotations
'i': rotate clockwise about the x-axis
'k': rotate counterclockwise about the x-axis
'o': rotate clockwise about the y-axis
'u': rotate counterclockwise about the y-axis
'l': rotate clockwise about the z-axis
'j': rotate counterclockwise about the z-axis
Translations
">" (right): move the light to the right
"<" (left): move the light to the left
"/\" (up): move the light up
"\/" (down): move the light down
"," (comma): move the light forward
"." (period): move the light backward
c) Camera interaction (5%)
Clicking the 'space' button should activate the camera movements (after clicking 'space', interaction with arrow keys will move (translate) the camera).

Keyboard controls (2.5%)
">" (right): move the camera to the right
"<" (left): move the camera to the left
"/\" (up): move the camera up
"\/" (down): move the camera down
Mouse controls (2.5%)
Clicking and dragging will visually move (translate) the scene around in the world, according to the direction of the movement. Practically, this is an inverse operation to the camera movement with the arrow keys (e.g. dragging left means the camera moves right). Both interaction schemes will ultimatively have the same end results, namely moving the camera in the world. The movement is supposed to be a pure translation, there should be no rotational component involved! Please note: if done correctly, this step should ensure that you have a correct implementation of OCS, WCS and VCS.

d) Shape transformations (15%)
Scaling (5%)
'a': decrease the width of the shape by a factor of 0.9
'A': increase the width of the shape by a factor of 1.1
'b': decrease the height of the shape by a factor of 0.9
'B': increase the height of the shape by a factor of 1.1
'c': decrease the depth of the shape by a factor of 0.9
'C': increase the depth of the shape by a factor of 1.1
Rotations (5%)
The center of the rotation should be the center of the coordinate system of the shape (or the center of the global coordinate system when all shapes are selected).
"i": rotate the current shape clockwise about the x-axis
"k": rotate the current shape counterclockwise about the x-axis
"o": rotate the current shape clockwise about the y-axis
"u": rotate the current shape counterclockwise about the y-axis
"l": rotate the current shape clockwise about the z-axis
"j": rotate the current shape counterclockwise about the z-axis
Translations (using arrow keys) (5%)
">" (right): move the shape to the right
"<" (left): move the shape to the left
"/\" (up): move the shape up
"\/" (down): move the shape down
"," (comma): move the shape forward
"." (period): move the shape backward
T4: Shadows (20%)
Implement shadow mapping so that objects in your scene cast realistic shadows onto a ground plane. Import and use 3D models.

The shadows should update dynamically as objects and lights move.
The ground plane must clearly render the shadows from the 3D shapes.
Provide a toggle option by using the h key.
