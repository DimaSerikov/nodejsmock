const filesCache = new Map();
const apiUrl = 'https://fe.it-academy.by/Examples/words_tree/';
const infoIcon = '<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Info:"><use xlink:href="#info-fill"/></svg>';

// Способ 1. Для работы с промисами используйте await. Используйте только стрелочные функции.
const fetchFileAsync = async (fileName) => {
  if (filesCache.has(fileName)) {
    return filesCache.get(fileName);
  }

  try {
    const response = await fetch(`${apiUrl}${fileName}`);

    if (!response.ok) {
      console.warn(`File ${fileName} not found. Status: ${response.status}`);
      return null;
    }

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch (error) {
      data = text;
    }

    filesCache.set(fileName, data);

    return data;
  } catch (error) {
    console.error(`Error loading file ${fileName}:`, error);
    return null;
  }
};

const parseFileAsync = async (fileName) => {
  const content = await fetchFileAsync(fileName);

  if (!content) {
    return '';
  }

  if (Array.isArray(content)) {
    const phrases = await Promise.all(content.map(parseFileAsync));
    return phrases.filter(Boolean).join(' ');
  }

  return content;
};

const getPhraseAsync = async () => {
  const phrase = await parseFileAsync('root.txt');
  const outputElement = document.getElementById('root');
  
  if (outputElement) {
    outputElement.innerHTML = infoIcon + phrase || 'Unable to retrieve the phrase';
  }
};

// Способ 2. Для работы с промисами используйте then. Используйте только традиционные функции, описанные ключевым словом function.
function fetchFileThen(fileName) {
  if (filesCache.has(fileName)) {
    return Promise.resolve(filesCache.get(fileName));
  }

  return fetch(`${apiUrl}${fileName}`)
    .then(function(response) {
      if (!response.ok) {
        console.warn(`File ${fileName} not found. Status: ${response.status}`);
        return null;
      }
      return response.text();
    })
    .then(function(text) {
      if (text === null) {
        return null;
      }

      let data;

      try {
        data = JSON.parse(text);
      } catch (error) {
        data = text;
      }
      filesCache.set(fileName, data);

      return data;
    })
    .catch(function(error) {
      console.error(`Error loading file ${fileName}:`, error);
      return null;
    });
}

function parseFileThen(fileName) {
  return fetchFileThen(fileName)
    .then(function(content) {
      if (!content) {
        return '';
      }

      if (Array.isArray(content)) {
        return Promise.all(content.map(parseFileThen))
          .then(function(phrases) {
            return phrases.filter(Boolean).join(' ');
          });
      }

      return content;
    });
}

function getPhraseThen() {
  parseFileThen('root.txt')
    .then(function(phrase) {
      const outputElement = document.getElementById('root');
      
      if (outputElement) {
        outputElement.innerHTML = infoIcon + phrase || 'Unable to retrieve the phrase';
      }
    })
    .catch(function(error) {
      console.error('Error executing Then:', error);
    });
}

// Trigger for dropdown on change
document.getElementById('script-select').addEventListener('change', () => {
  const selectedMethod = this.value;

  document.getElementById('root').innerText = 'Loading...';
  filesCache.clear();

  selectedMethod === 'async' ? getPhraseAsync() : getPhraseThen();
});

// default load
getPhraseAsync();