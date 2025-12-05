I'm currently trying to learn and deeply understand basic concept of Computer graphics. I'm not just looking for a quick answer or a final solution; my main goal is to grasp the underlying mechanisms and intuition behind it.

Please treat this conversation as a learning journey. Feel free to challenge my assumptions, ask me to explain my reasoning, or suggest alternative ways of thinking about the problem. If you can help me build a solid foundation rather than just patching holes, that would be fantastic.

Now the project specification for more context>

This is the final goal> Trecreate aspects from the 1987 video game PacMania.

This are the tasks>

FOUNDATIONS [ 30% ]
Create a labyrinth (not too sophisticated, but also not too simple) with a ground plane and a yellow ball that can be moved around on top of that plane. [ 15% ]
The ball can be moved using the arrow keys on the keyboard
Note: no object-intersection testing with the walls necessary at this stage, the ball can be moved through walls
Phong shading and lighting similar to the requirements in lab 1b are expected in this lab to see the structure of the the ball and possible details of the labyrinth
The light should be positioned in a way so that you can clearly identify the 3D-structure of the scene
We leave it up to you what kind of light (point light at a certain position or directional light at infinity) you are using

Exchange the ball for an animated Pacman which has eyes and opens and closes its mouth continuously. [ 15% ]
The eyes can not be static, but have to move according to the opening and closing of the mouth
Pacman has to turn (continuously) into and face in the direction of the movement
No specific design inside the mouth required (like having a tongue or anything alike)

GRAPHICAL ASPECTS [ 15% ]
Create a shear-view that can be toggled. [ 5% ]
It should look similar to the video example, but we leave the exact angles up to you.
Pressing the "v"-button should toggle between the shear view and the 3D view from the same camera position.

Project a shadow of Pacman (and possibly other objects like walls) on the ground floor [ 10% ]
Again, ensure that the light is not coming from above but from an angle/position where you can see exciting projections.
Shadows only have to appear on the ground floor, not required on labyrinth walls or something similar.
Note: the shadows in the original game are behaving very wrong - please don’t recreate this behavior!
Instead, solve this problem using solutions presented in the lectures.


GAMING ASPECTS [ 30% ]
Continuous movement (when an arrow is pressed, Pacman runs into this direction until hitting the wall or another arrow button is pressed). [ 2.5% ]

The camera centers on Pacman (the camera moves with Pacman so he stays at the center of the screen). [ 2.5% ]

Make the walls “solid” (Pacman is not able to walk through walls anymore). [ 2.5% ]
This can be achieved through object intersection tests or position based tests or … there are many ways to implement this, we leave the details up to you

Put little dots to eat for Pacman on empty tiles in the labyrinth. [ 2.5% ]
When he moves over them, he “eats" them and they disappear
When all dots are eaten, the game should (at least) restart from the beginning

Make Pacman jump when hitting the spacebar. [ 5% ]
Doesn’t have to follow physical laws, but it should at least resemble some kind of jump behaviour
We recommend using a sine function to model this in a simple way, but any function that decreases its speed towards the top and increases on the way down is generally allowed and possible.
The spacebar must not be held the entire time of the jump (pressed once, the jump is performed until its very end)
If Pacman is moving and jumping at the same time, the motion has to continue (jumping is not interrupting directional movement)
Note: when Pacman jumps, he can not eat the dots from the the floor (they remain when Pacman jumps over them)
Note: In the original game, Pacman can not jump over walls, but this constraint is not required. We leave it up to you if Pacman can jump over a wall or stops mid air when trying to do so.

Create at least two enemy ghosts. [ 15% ]
They should be modeled after the ghosts from the game, but at least they should have a top-rounded head, a torso, and eyes.
They can wander the labyrinth randomly; they don’t have to seek or follow Pacman.
The movement has to be continuous and can not be abrupt, meaning that the ghost moves straight until hitting a wall.
They do have to interact with Pacman.
On interaction with Pacman, the game should at least freeze for a couple of seconds (to signal the end of the game) and then restart from the beginning.
The eyes must always be oriented toward Pacman in a straight line, independent of the walls (ghosts can see through walls).
They even have to follow Pacman when he is jumping!

AVDVANCED GAMING ASPECTS [ 25% ]
More game-like additions. [ 2.5% per addition, maximum 10% ]
Any addition, that adds to a more advanced game-like experience (counting points, having lives, music and sound-FX, …) will be awarded with 2.5% each up to 10%
If you have any ideas and you are unsure about it, please ask us beforehand

Create a special state for enemies [ 15% ]
When Pacman eats a 'big ball', the ghosts change into a state in which Pacman can eat them.
This state is only temporary, after the certain timelapse they have to go back to their original state in which they are dangerous to pacman.
While in this special state, the ghosts have to interact with Pacman in a different way
On interaction with Pacman, the ghosts have at the very least to disappear from the screen ('getting eaten') and respawn a couple seconds later.
