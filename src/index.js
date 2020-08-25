import 'vtk.js/Sources/favicon';
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkXMLPolyDataReader from 'vtk.js/Sources/IO/XML/XMLPolyDataReader';
import Base64 from 'vtk.js/Sources/Common/Core/Base64';

import axes from './axes.js';
import logo from './logo.js';
import interactor from './interactor.js';
import ui from './ui.js';

// ----------------------------------------------------------------------------
// Standard scene code setup
// ----------------------------------------------------------------------------

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance();
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();

axes.addAxes(fullScreenRenderer);
logo.addLogo(fullScreenRenderer);
interactor.useVtkInteractorStyle(fullScreenRenderer);

const resetCamera = renderer.resetCamera;
const render = renderWindow.render;

// ----------------------------------------------------------------------------
// Rendering
// ----------------------------------------------------------------------------

const mapper = vtkMapper.newInstance();
const actor = vtkActor.newInstance();

// initialize UI with the single actor
ui.initUserInterface(fullScreenRenderer, actor);

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
