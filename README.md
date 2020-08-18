# vtk.js Standalone VTP Viewer

This is for embedding a VTP file into a standalone HTML web app for 3D viewing
with vtk.js

## Demo

Download and open the `demo.html` page:

![demo](./demo.gif)

## Usage

Please head over to the [releases page](https://kwgitlab.kitware.com/bane.sullivan/vtp-web-viewer/-/releases)
and download the pre-built HTML file from the latest release notes with the
Python script for "injecting" a VTP mesh file into the viewer.

Once you have both files downloaded, point the Python script to both your VTP
mesh file and the prebuilt HTML file:

```
python inject_data.py <path_to_mesh>.vtp index.html
```

This will ouptut a new HTML file next to the mesh file where you can view that
mesh and share the HTML file for anyone to view it (with/without an internet
connection and without sharing the original mesh file).

## Local Development

Install the app:

```
npm install
```

Build the static HTML app:

```
npm run-script build
```

Inject your `.vtp` mesh file into the app:

```
python inject_data.py <path_to_mesh>.vtp dist/index.html
```

And then you can share the produced `.html` file with the same basename as the
mesh for 3D viewing anywhere!

## Notes

For building source in the HTML file, see https://github.com/DustinJackson/html-webpack-inline-source-plugin/issues/79
