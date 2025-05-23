![alt text](https://i.imgur.com/Z32h8hd.png)

# Custom Fuselage Shader

The purpose of this project was to rewrite the orignal fuselage shader in FlightGear to create a more attractive aesthetic, and be more akin to the graphical style of a commercial simulator. The project is still incomplete and has many issues but as I learn and experiment further I hope to eliminate as many of these issues as possible. The shader replaces the model-combined shader, so it will automatically be applied to any aircraft referencing them. Good examples of aircraft within FlightGear which represent this shader well are the Boeing 777 and Cessna 182.

## Installing

1) Download the project.
2) Open the Flightgear root folder.
3) Open the "NEW" folder.
4) Drag the "/Shaders" folder into "/data", overwriting the original shader files.

## Issues

* Lighting too bright at night
* Lightmap's currently not working
* Reflection's are static
* Normal Mapping not yet included

## Uninstalling

The folder labeled "NEW" contains the modified shader files. The folder labeled "OLD" contains the original shader files. Should you wish to revert back to the old shader files, simply repeat the Installation process but instead with the "OLD" folder.
