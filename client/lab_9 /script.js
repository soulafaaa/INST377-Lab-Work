function getRandomIntInclusive(min, max) {
  const newmin = Math.ceil(min);
  const newmax = Math.floor(max);
  return Math.floor(Math.random() * (newmax - newmin + 1) + newmin);
}

function injectHTML(list) {
  console.log('fired injectHTML');
  const target = document.querySelector('#restaurent_list');
  target.innerHTML = '';

  const listEL = document.createElement('ol');
  target.appendChild(listEL);

  list.forEach((item) => {
    const el = document.createElement('li');
    el.innerText = item.name;
    listEL.appendChild(el);
  });
  /*
    ## JS and HTML Injection
      There are a bunch of methods to inject text or HTML into a document using JS
      Mainly, they're considered "unsafe" because they can spoof a page pretty easily
      But they're useful for starting to understand how websites work
      the usual ones are element.innerText and element.innerHTML
      Here's an article on the differences if you want to know more:
      https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent#differences_from_innertext

    ## What to do in this function
      - Accept a list of restaurant objects
      - using a .forEach method, inject a list element into your index.html for every element in the list
      - Display the name of that restaurant and what category of food it is
  */
}

function processRestaurants(list) {
  console.log('fired restaurants list');

  const range = [...Array(15).keys()];
  const newArray = range.map((item) => {
    const index = getRandomIntInclusive(0, list.length);
    return list[index];
  });
  return newArray;
}

function filterList(list, filterInputValue) {
  return list.filter((item) => {
    if (!item.name) { return; }
    const lowerCaseName = item.name.toLowerCase();
    const lowerCaseQuery = filterInputValue.toLowerCase();
    return lowerCaseName.includes(lowerCaseQuery);
  });
}

function initMAp() {
  console.log('initMAp');
  const map = L.map('map').setView([38.7849, -76.8721], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  return map;
}

function marketPlace(array, map) {
  // console.log('marketPlace', array);
  // const marker = L.marker([51.5, -0.09]).addTo(map);
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      layer.remove();
    }
  });
  array.forEach((item, index) => {
    const {coordinates} = item.geocoded_column_1;
    L.marker([coordinates[1], coordinates[0]]).addTo(map);
    if (index === 0) {
      map.setView([coordinates[1], coordinates[0]], 13);
    }
  });
}

function initChart (targetElement, object) {
  const labels = Object.keys(object);
  const info = Object.keys(object).map((item) => object[item].length);

  const data = {
    labels: labels,
    datasets: [{
      label: 'Resturant by Category',
      backgroundColor: 'rgb(255,99,132)',
      borderColor: 'rgb(255,99,132)',
      data: info
    }]
  };

  const config = {
    type: 'bar',
    data: data,
    options: {}
  };

  return new Chart(
    targetElement,
    config
  );
}

function changeChart(chart, dataObj) {
  const labels = Object.keys(dataObj);
  const info = Object.keys(dataObj).map((item) => dataObj[item].length);

  chart.data.labels = labels;
  chart.data.datasets.forEach((set) => {
    set.data = info;
    return set;
  });
  chart.update();
}

function shapeDataForLineChart(array) {
  return array.reduce((collection, item) => {
    if (!collection[item.category]) {
      collection[item.category] = [item];
    } else {
      collection[item.category].push(item);
    }
    return collection;
  }, {});
}

async function getData () {
  const url = 'https://data.princegeorgescountymd.gov/resource/umjn-t2iz.json';
  const data = await fetch(url);
  const json = await data.json();
  const reply = json.filter((item) => Boolean(item.geocoded_column_1)).filter((item) => Boolean(item.name));
  return reply;
}

async function mainEvent() {
  const form = document.querySelector('.main_form'); // get your main form so you can do JS with it
  const submit = document.querySelector('#get-resto');// get a reference to your submit button
  const loadAnimation = document.querySelector('.lds-ellipsis');
  const chartTarget = document.querySelector('#myChart');
  submit.style.display = 'None'; // let your submit button disappear

  const chartData = await getData();
  const shapedData = shapeDataForLineChart(chartData);

  const myChart = initChart(chartTarget, shapedData);

  // This IF statement ensures we can't do anything if we don't have information yet
  if (chartData?.length > 0) {
    submit.style.display = 'block';

    loadAnimation.classList.remove('lds-ellipsis');
    loadAnimation.classList.add('lds-ellipsis_hidden');

    const currentList = [];

    form.addEventListener('input', (event) => {
      console.log(event.target.value);
      const newFilterlist = filterList(currentList, event.target.value);
      injectHTML(newFilterlist);
      const localData = shapeDataForLineChart(tlist);
      changeChart(tlist, localData);
      // marketPlace(newFilterlist, pageMap);
    });
  }

  form.addEventListener('submit', (submitEvent) => {
    submitEvent.preventDefault();
    currentList = processRestaurants(chartData);

    injectHTML(currentList);
    const localData = shapeDataForLineChart(chartData);
    changeChart(myChart, localData);
  });
}

/*
    This last line actually runs first!
    It's calling the 'mainEvent' function at line 57
    It runs first because the listener is set to when your HTML content has loaded
  */
document.addEventListener('DOMContentLoaded', async () => mainEvent());