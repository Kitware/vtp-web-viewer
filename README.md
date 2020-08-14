# vtk.js Standalone VTP Viewer

This is for embedding a VTP file into a standalone HTML web app for 3D viewing
with vtk.js

## Usage

Build the static HTML app:

```
npm run-script build
```

then inject your `.vtp` mesh file into the app:

```
python inject_data.py <path_to_mesh>.vtp dist/index.html
```

And then you can share the produced `.html` file with the same basename as the
mesh for 3D viewing anywhere!

## Notes

For building source in the HTML file, see https://github.com/DustinJackson/html-webpack-inline-source-plugin/issues/79


## Demo

!![demo]('./demo.html')
