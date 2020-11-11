import { FirebaseModuleConfiguration } from '@nuxtjs/firebase'

const firebaseConfig: FirebaseModuleConfiguration = {
  config: {
    apiKey: 'AIzaSyBZy7p8ZwSfbgNnaNml8oSTdRTcEV6blI8',
    authDomain: 'word2vec-visualizer.firebaseapp.com',
    databaseURL: 'https://word2vec-visualizer.firebaseio.com',
    projectId: 'word2vec-visualizer',
    storageBucket: 'word2vec-visualizer.appspot.com',
    messagingSenderId: '543556392005',
    appId: '1:543556392005:web:8856c35c783c07b0853f2c',
    measurementId: 'G-EDL6TCM3FW',
  },
  services: {
    analytics: true,
  },
}

export default firebaseConfig
