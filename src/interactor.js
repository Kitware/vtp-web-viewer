import vtkInteractorStyleManipulator from 'vtk.js/Sources/Interaction/Style/InteractorStyleManipulator';
import InteractionPresets from 'vtk.js/Sources/Interaction/Style/InteractorStyleManipulator/Presets';

function useVtkInteractorStyle (fullScreenRenderer) {
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
}

export default { useVtkInteractorStyle };
