import 'vtk.js/Sources/favicon';
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkXMLPolyDataReader from 'vtk.js/Sources/IO/XML/XMLPolyDataReader';
import Base64 from 'vtk.js/Sources/Common/Core/Base64';

import vtkInteractorStyleManipulator from 'vtk.js/Sources/Interaction/Style/InteractorStyleManipulator';
import InteractionPresets from 'vtk.js/Sources/Interaction/Style/InteractorStyleManipulator/Presets';

import controlPanel from './controller.html';
import style from './controller.css'; // need to import for webpack to bundle it

// ----------------------------------------------------------------------------
// Standard scene code setup
// ----------------------------------------------------------------------------

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance();
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();

const resetCamera = renderer.resetCamera;
const render = renderWindow.render;

const interactorStyleDefinitions = [
  { type: 'pan', options: { button: 3 } }, // Pan on Right button drag
  { type: 'pan', options: { button: 1, shift: true } }, // Pan on Shift + Left button drag
  { type: 'zoom', options: { button: 1, control: true } }, // Zoom on Ctrl + Left button drag
  { type: 'zoom', options: { dragEnabled: false, scrollEnabled: true } }, // Zoom on scroll
  { type: 'rotate', options: { button: 1 } } // Rotate on Left button drag
];

const interactorStyle = vtkInteractorStyleManipulator.newInstance();
fullScreenRenderer.getInteractor().setInteractorStyle(interactorStyle);
InteractionPresets.applyDefinitions(interactorStyleDefinitions, interactorStyle);

fullScreenRenderer.addController(controlPanel);
const uiToggle = document.getElementById('toggle');
const uiContent = document.getElementById('content');
const representationSelector = document.getElementById('representations');
const pointSizeChange = document.getElementById('pointSize');
const pointSizeRow = document.getElementById('pointSizeRow');
const lightingChange = document.getElementById('lighting');
const lightingRow = document.getElementById('lightingRow');
const ambientChange = document.getElementById('ambient');
const colorsChange = document.getElementById('colors');

// Set up UI hide/show toggler
uiToggle.addEventListener('click', function () {
  this.classList.toggle('active');
  if (uiContent.style.display === 'block') {
    uiContent.style.display = 'none';
  } else {
    uiContent.style.display = 'block';
  }
});

// ----------------------------------------------------------------------------
// Rendering
// ----------------------------------------------------------------------------

const mapper = vtkMapper.newInstance();
const actor = vtkActor.newInstance();

representationSelector.addEventListener('change', (e) => {
  // make sure this hides/shows the point size slider too
  let newRepValue = Number(e.target.value);
  if (newRepValue === 3) {
    actor.getProperty().setEdgeVisibility(1);
    newRepValue = 2;
  } else {
    actor.getProperty().setEdgeVisibility(0);
  }
  actor.getProperty().setRepresentation(newRepValue);

  if (newRepValue === 0) {
    // Points rep - show the slider for point size
    pointSizeRow.style.display = 'block';
    lightingRow.style.display = 'none';
  } else {
    // hide it
    pointSizeRow.style.display = 'none';
    lightingRow.style.display = 'block';
  }

  renderWindow.render();
});
// if representationSelector is set to surface by default, then hide point slider
if (Number(representationSelector.value) === 2) {
  pointSizeRow.style.display = 'none';
  lightingRow.style.display = 'block';
} else {
  pointSizeRow.style.display = 'block';
  lightingRow.style.display = 'none';
}

pointSizeChange.addEventListener('input', (e) => {
  const pointSize = Number(e.target.value);
  actor.getProperty().setPointSize(pointSize);
  renderWindow.render();
});
actor.getProperty().setPointSize(Number(pointSizeChange.value));

lightingChange.addEventListener('change', (e) => {
  const value = e.target.checked;
  actor.getProperty().setLighting(value);
  renderWindow.render();
});
// Make sure the lighting setting matches the toggle initial state
lightingChange.dispatchEvent(new Event('change'));

ambientChange.addEventListener('input', (e) => {
  const value = Number(e.target.value) / 100;
  actor.getProperty().setAmbient(value);
  renderWindow.render();
});
actor.getProperty().setAmbient(Number(ambientChange.value) / 100);

colorsChange.addEventListener('change', (e) => {
  const value = e.target.checked;
  actor.getMapper().setScalarVisibility(value);
  if (!value) {
    lightingChange.checked = true;
    lightingChange.dispatchEvent(new Event('change'));
  }
  renderWindow.render();
});

// -----------------------------------------------------------
// Make some variables global so that you can inspect and
// modify objects in your browser's developer console:
// -----------------------------------------------------------

global.render = render;
global.actor = actor;
global.fullScreenRenderer = fullScreenRenderer;

// ----------------------------------------------------------------------------
// File IO
// ----------------------------------------------------------------------------

const reader = vtkXMLPolyDataReader.newInstance();
global.reader = reader;

function loadBase64Content (contentToLoad) {
  var buffer = Base64.toArrayBuffer(contentToLoad); // TODO: this doesn't work?
  // const buffer = _base64ToArrayBuffer(contentToLoad);
  reader.parseAsArrayBuffer(buffer);
  return reader.getOutputData(0);
}

// ----------------------------------------------------------------------------
// Where we inject a VTP file as a base64 string in `contentToLoad`
// ----------------------------------------------------------------------------

// INSERT DATA HERE:
var contentToLoad = 'this_is_the_content';

// now we have access to the PolyData
const polydata = loadBase64Content(contentToLoad);

actor.setMapper(mapper);
mapper.setInputData(polydata);
renderer.addActor(actor);

// ----------------------------------------------------------------------------
// Final Scene Initiation
// ----------------------------------------------------------------------------

resetCamera();
render();
