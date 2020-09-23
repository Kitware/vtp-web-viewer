import 'vtk.js/Sources/favicon';
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkXMLPolyDataReader from 'vtk.js/Sources/IO/XML/XMLPolyDataReader';
import Base64 from 'vtk.js/Sources/Common/Core/Base64';
import { throttle } from 'vtk.js/Sources/macro';

// import axes from './axes.js';
import interactor from './interactor.js';
import logo from './logo.js';
import measure from './measure.js';
import ui from './ui.js';

// ----------------------------------------------------------------------------
// Standard scene code setup
// ----------------------------------------------------------------------------

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance(
  { background: [1, 1, 1] }
);
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();

// axes.addAxes(fullScreenRenderer);
logo.addLogo(fullScreenRenderer);
interactor.useVtkInteractorStyle(fullScreenRenderer);

const resetCamera = renderer.resetCamera;
const render = renderWindow.render;

// ----------------------------------------------------------------------------
// Rendering
// ----------------------------------------------------------------------------

const mapper = vtkMapper.newInstance();
const actor = vtkActor.newInstance();

// Set color as tan with white background
actor.getProperty().setColor(0.824, 0.706, 0.549);

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

const b = polydata.getBounds();
const length = Math.sqrt((b[1] - b[0]) ** 2 + (b[3] - b[2]) ** 2 + (b[5] - b[4]) ** 2);

// ----------------------------------------------------------------------------
// Distance Measurement Tool
// ----------------------------------------------------------------------------

const tool = new measure.DistanceTool(fullScreenRenderer, length * 0.0025);
global.tool = tool;

function handlePickEvent (e) {
  /** On a P keypress, save the location. **/
  var keyCode = e.keyCode;
  if (keyCode === 112 || keyCode === 80) { // p key
    // console.log('You pressed P!');
    tool.savePickEvent();
  }
}

const throttleMouseHandler = throttle((event) => {
  tool.pickOnMouseEvent(event);
}, 100);
document.addEventListener('mousemove', throttleMouseHandler);

document.addEventListener('keypress', handlePickEvent);

// ----------------------------------------------------------------------------
// Final Scene Initiation
// ----------------------------------------------------------------------------

resetCamera();
render();
