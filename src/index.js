import { NativeModules } from 'react-native';
const { PhotoEditor } = NativeModules;

let exportObject = {};

const defaultOptions = {
  path: '',
  stickers: [],
  label_shape: '',
};

exportObject = {
  open: (optionsEditor) => {
    const { translations, ...currentOptions } = optionsEditor;

    const options = {
      ...defaultOptions,
      ...currentOptions,
      ...translations,
    };
    return new Promise(async (resolve, reject) => {
      try {
        const response = await PhotoEditor.open(options);
        if (response) {
          resolve(response);
          return true;
        }
        throw 'ERROR_UNKNOW';
      } catch (e) {
        reject(e);
      }
    });
  },
};

export default exportObject;
