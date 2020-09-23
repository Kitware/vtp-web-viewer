import vtkInteractorStyleManipulator from 'vtk.js/Sources/Interaction/Style/InteractorStyleManipulator';
import InteractionPresets from 'vtk.js/Sources/Interaction/Style/InteractorStyleManipulator/Presets';

function getCenterOfScene (renderer) {
  const bounds = renderer.computeVisiblePropBounds();
  const center = [0, 0, 0];

  center[0] = (bounds[0] + bounds[1]) / 2.0;
  center[1] = (bounds[2] + bounds[3]) / 2.0;
  center[2] = (bounds[4] + bounds[5]) / 2.0;

  return center;
}

function useVtkInteractorStyle (fullScreenRenderer) {
  const interactorStyleDefinitions = [
    { type: 'pan', options: { button: 2 } }, // Pan on middle button drag
    { type: 'pan', options: { button: 1, shift: true } }, // Pan on Shift + Left button drag
    { type: 'zoom', options: { button: 3 } }, // Zoom on right button drag
    { type: 'zoom', options: { button: 1, control: true } }, // Zoom on Ctrl + Left button drag
    { type: 'zoom', options: { dragEnabled: false, scrollEnabled: true } }, // Zoom on scroll
    { type: 'rotate', options: { button: 1 } } // Rotate on Left button drag
  ];

  const interactorStyle = vtkInteractorStyleManipulator.newInstance();
  fullScreenRenderer.getInteractor().setInteractorStyle(interactorStyle);
  InteractionPresets.applyDefinitions(interactorStyleDefinitions, interactorStyle);

  function resetCamera () {
    const center = getCenterOfScene(fullScreenRenderer.getRenderer());
    interactorStyle.setCenterOfRotation(center);
    return fullScreenRenderer.getRenderer().resetCamera();
  }

  return [interactorStyle, resetCamera];
}

export default { useVtkInteractorStyle, getCenterOfScene };
