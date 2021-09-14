# Landscape Generation with JavaScript

I've been working on a browser-based landscape generator written in JavaScript, [you can try it out here](https://codebox.net/html_raw/landscape-generator/index.html).
It can produce images like these:

<img src="https://codebox.net/assets/images/landscape-generator/1631437224656.png" width="250" height="250"> <img src="https://codebox.net/assets/images/landscape-generator/1631437042644.png" width="250" height="250"> <img src="https://codebox.net/assets/images/landscape-generator/1631437469270.png" width="250" height="250">

## Initial Terrain Generation

The basic shape of the terrain is generated using [Perlin Noise](https://en.wikipedia.org/wiki/Perlin_noise), an algorithm commonly used in
computer graphics to create natural looking surface shapes and textures. For each landscape image I generate 6 sets of Perlin Noise at different scales:

<img src="https://codebox.net/assets/images/landscape-generator/perlin001.png" width="150" height="150"> <img src="https://codebox.net/assets/images/landscape-generator/perlin003.png" width="150" height="150"> <img src="https://codebox.net/assets/images/landscape-generator/perlin007.png" width="150" height="150"> <img src="https://codebox.net/assets/images/landscape-generator/perlin020.png" width="150" height="150"> <img src="https://codebox.net/assets/images/landscape-generator/perlin055.png" width="150" height="150"> <img src="https://codebox.net/assets/images/landscape-generator/perlin150.png" width="150" height="150">

None of these surfaces look particularly natural on their own, however when they are combined together the result gives a reasonable approximation of real terrain.
Some weighting is used when combining the surfaces - the lower resolution surfaces have the greatest influence on the final result, defining
the overall shape of the terrain. The higher-resolution surfaces add realistic texture at various scales, without really affecting the overall geography. Combining the 6
surfaces shown above gives the following result:

<img src="https://codebox.net/assets/images/landscape-generator/perlin_combined.png"  width="400" height="400">

## Simulating Erosion
Natural landscapes are subject to erosion due to wind and rainfall. These processes affect the shape of the land,
smoothing out rough ground and creating distinctive features such as river valleys and coastal inlets.

I have simulated water erosion using [an algorithm outlined in this paper by Hans Theobald Beyer](https://www.firespark.de/resources/downloads/implementation%20of%20a%20methode%20for%20hydraulic%20erosion.pdf). The algorithm calculates the path that would be taken by a water droplet if it were placed at a certain location on the landscape, and allowed to flow freely downhill under gravity. The droplet's position is tracked until it reaches the sea, or it comes to rest in a pit or indentation in the ground. As the droplets move they pick up material from the ground, a process which continues until they reach their carrying capacity. Once a droplet cannot absorb any more material, or when its momentum carries it up a slope, it deposits some of its material onto the ground. In this way material is slowly redistributed by the water in a manner similar to natural hydraulic erosion. Paths that are followed by droplets from many different locations become heavily eroded, forming channels and valleys.

This video shows the erosion process taking place with 200,000 simulated water droplets. Notice how the shape of the lake changes as valleys form:

<a href="https://codebox.net/assets/video/landscape-generator/erosion.mp4"><img src="https://codebox.net/assets/video/landscape-generator/erosion_poster.png" width="250" height="250"></a>

### Smoothing
The surfaces that result from simulating water erosion are often quite rough looking. A more natural appearance can be achieved by performing some smoothing on the resulting terrain, approximating the effect of abrasive processes such as glaciation and wind. I used the [Gaussian Blur](https://en.wikipedia.org/wiki/Gaussian_blur) algorithm to do this, changing the height of each point on the landscape based on the heights of its neighbours. This local averaging causes points that are higher than their neighbours to be lowered slightly, and vice-versa.

This video shows the effect of smoothing on the landscape, notice how the roughness and fine details are worn away as the process continues:

<a href="https://codebox.net/assets/video/landscape-generator/smoothing.mp4"><img src="https://codebox.net/assets/video/landscape-generator/smoothing_poster.png" width="250" height="250"></a>

## Rivers
The process of calculating the path taken by water droplets, described above, can also be used to determine where streams and rivers would form on the landscape.
Each point on the map is considered in turn, and if the elevation of that point is above sea-level then a water droplet is placed there and its path calculated.
Once all possible droplet paths have been covered we check how many times each point on the map was visited by a droplet, the more visits a location receives, the wetter the ground in that place will become. Map locations are coloured according to how much water passes through them, the end result is a fairly convincing set of rivers and lakes, like this:

<img src="https://codebox.net/assets/images/landscape-generator/rivers.png" width="400" height="400">

## Waves
For aesthetic purposes, and to provide greater contrast between land and sea, I added waves around the coastline. The waves are rendered by calculating sets of points in the sea that are all equidistant from the nearest point on land. Five such sets of points are calculated, and then lines are drawn between them in progressively darker colours to simulate the sea bed dropping away as we travel further off shore:

<img src="https://codebox.net/assets/images/landscape-generator/waves.png" width="400" height="400">

## Contours
The landscape generator can add contour lines to the image. In order to draw contour lines we need to draw lines between adjacent points that have the same elevation.
The standard approach for achieving this is to use the [Marching Squares algorithm](https://en.wikipedia.org/wiki/Marching_squares):

<img src="https://codebox.net/assets/images/landscape-generator/contours.png" width="400" height="400">

## Random Number Generation
Many of the algorithms used for this project require a random number generator. Although JavaScript provides a way to generate random numbers using the `Math.random()` function, there is no way to specify the [seed value](https://en.wikipedia.org/wiki/Random_seed), and therefore no way to generate reproducible outputs. So, instead of using the built-in random number generator I used the [Mulberry32](https://stackoverflow.com/a/47593316/138256) algorithm which can be initialised with a seed. As a result the landscape generator can accept a numeric seed, and the same seed will always yield the same landscape - this is useful because it allows you to recreate any particularly interesting terrains that you find.

