import { glob } from 'glob';
import path from 'path';

interface SvgData {
  [key: string]: { folderName: string; files: { name: string; path: string }[] };
}

const getSvgs = (): SvgData => {
  const svgFiles: SvgData = {};

  // Get the absolute path to the SVG folder
  const svgFolderPath = path.join(process.cwd(), 'public');

  // Read all SVG files from the nested folders
  const files = glob.sync(`${svgFolderPath}/**/*.svg`);

  // Group SVG files by category (folder name)
  files.forEach((file) => {
    const category = path.dirname(file).split(path.sep).slice(-2);
    const folderName = category[category.length - 1];
    const fileName = path.basename(file, '.svg');
    const relativePathFromPublic = path.relative(svgFolderPath, file).replace(/\\/g, '/');

    const categoryPath = category.join('/');

    if (!svgFiles[categoryPath]) {
      svgFiles[categoryPath] = { folderName, files: [] };
    }

    svgFiles[categoryPath].files.push({ name: fileName, path: relativePathFromPublic });
  });

  return svgFiles;
};

export default getSvgs;