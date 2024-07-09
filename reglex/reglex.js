let colCount = 3;
let catColCount = 3;
let extended = false;
let chunkSize = 300;

let isReady = false;
let words;
let categories;
let selectedCategories;
let filterCategories = false;
let searchBox = document.getElementById('search-box');
let tbl = document.getElementById('results-tbl-bdy');
let errorDialog = document.getElementById('error-dialog');
let categoriesList = document.getElementById('categories-list');
let categoriesDiv = document.getElementById('categories-div');
let categorySearch = document.getElementById('categories');
let showMoreBtn = document.getElementById('show-more-btn');
let resultsCountText = document.getElementById('results-count-txt');

let categoryBoxes = [];

fetch('./words.json').then(r => r.json()).then(data => {
    words = data[0];
    categories = data[1];
    selectedCategories = new Array(categories.length).fill(false);
    isReady = true;

    for (let i = 0; i < categories.length; i++) {
        let cat = categories[i];
        if (cat !== undefined) {
            let li = document.createElement('li');
            let label = document.createElement('label');
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = cat;
            checkbox.addEventListener('change', function() {
                selectedCategories[i] = this.checked;
                runSearch();
            });
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(cat));
            li.appendChild(label)
            categoryBoxes.push(li);
            categoriesList.appendChild(li);
        }
    }
    document.getElementById("loading-text").remove();
    runSearch();
});

document.getElementById('search-categories-box').addEventListener('keyup', function() {
    let search = this.value;
    for (let i = 0; i < categoryBoxes.length; i++) {
        categoryBoxes[i].style.display = categories[i].includes(search.toLowerCase()) ? 'block' : 'none';
    }
});

document.getElementById('include-extended').addEventListener('change', function() {
    extended = this.checked;
    runSearch();
});

document.getElementById('filter-categories').addEventListener('change', function() {
    filterCategories = this.checked;
    categoriesDiv.style.display = filterCategories ? 'block' : 'none';
    runSearch();
});

function displayErrorMsg(errorMsg) {
    errorDialog.style.display = 'block';
    errorDialog.innerHTML = errorMsg;
}

function hideErrorMsg() {
    errorDialog.style.display = 'none';
}

searchBox.addEventListener('keyup', function() {
    runSearch();
});

function runSearch(limit = chunkSize) {
    var search = searchBox.value;

    let pattern;
    try {
        pattern = new RegExp(search, 'i');
    } catch (e) {
        searchBox.ariaInvalid = true;
        displayErrorMsg(e.toString());
        return;
    }
    hideErrorMsg();
    searchBox.ariaInvalid = false;
    let count = 0;
    let matches = words.filter((word_struct) => (pattern.test(word_struct[0]) || pattern.test(word_struct[1])) &&
                                                        (extended || !word_struct[2]) &&
                                                        (!filterCategories || word_struct[3].some((cat)=>selectedCategories[cat])) &&
                                                        (count < limit) && (++count));
    tbl.innerHTML = '';

    for (let i = 0; i < matches.length; i += colCount) {
        let row = tbl.insertRow();
        for (let j = 0; j < colCount; j++) {
            let cell = row.insertCell();
            let word_struct = matches[i + j];
            if (word_struct !== undefined) {
                let atag = document.createElement('a')
                //          word || compact
                let text = (word_struct[1] || word_struct[0]);
                atag.innerText = text;
                // look up grundform
                atag.href = 'https://svenska.se/saol/?sok=' + encodeURIComponent(words[word_struct[4]][0]);
                atag.target = '_blank';
                cell.appendChild(atag);
            }
        }
    }
    resultsCountText.innerText = `(${count}${count < limit ? '' : '+'})`
    showMoreBtn.style.display = count < limit ? 'none' : 'block';
    showMoreBtn.onclick = function() {
        runSearch(limit + chunkSize);
    };
}