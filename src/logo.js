import style from './controller.css'; // need to import for webpack to bundle it
import icon from './favicon.png';

function addLogo (fullScreenRenderer) {
  const container = fullScreenRenderer.getContainer();
  const linker = document.createElement('a');
  linker.target = '_blank';
  linker.href = 'http://www.telesculptor.org/';
  const logo = new Image();
  logo.src = icon;
  // TODO: fix stylesheet usage
  // logo.setAttribute('class', style.logo);
  logo.style.position = 'absolute';
  logo.style.top = '25px';
  logo.style.right = '25px';
  logo.style.height = '50px';
  logo.style.cursor = 'pointer';
  linker.appendChild(logo);
  container.appendChild(linker);
}

export default { addLogo };
