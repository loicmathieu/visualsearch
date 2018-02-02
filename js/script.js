(function () {
    'use strict';

    const Cropper = window.Cropper;

    window.onload = () => {
        console.log('Application loaded !');

        const cropButton = document.getElementById('crop-button');
        let croppedImage = document.getElementById('cropped-image');
        const pictureIconButton = document.getElementById('picture-icon-button');
        const preview = document.getElementById('preview-image'); //selects the query named img
        const cropContainer = document.getElementById('crop-container');
        const inputContainer = document.getElementById('input-container');
        const resultProducts = document.getElementById('result-products');
        const optionContainer = document.getElementsByClassName('options-container')[0];
        const selectUniversContainer = document.getElementById('select-univers-container');
        const loader = document.getElementById('loader');
        const backButton = document.getElementById('back-button');
        const rbtnFemme = document.getElementById('femme');
        const rbtnHomme = document.getElementById('homme');
        const rbtnFille = document.getElementById('fille');
        const rbtnGarcon = document.getElementById('garcon');
        const rbtnBebe = document.getElementById('bebe');
        const restartButton = document.getElementById('restart-button');
        let univers = 'UNV1000001';
        let result;
        let cropper;
        let step = 0;

        hide(preview);

        initEventListeners();


        function initEventListeners() {
            pictureIconButton.addEventListener('click', () => clickPictureIconButton());

            rbtnFemme.addEventListener('change', setUnivers);
            rbtnHomme.addEventListener('change', setUnivers);
            rbtnFille.addEventListener('change', setUnivers);
            rbtnGarcon.addEventListener('change', setUnivers);
            rbtnBebe.addEventListener('change', setUnivers);

            cropButton.addEventListener('click', () => {
                result = cropper.getCroppedCanvas();
                croppedImage.appendChild(result);
                hide(cropContainer);
                hide(cropButton);
                result.toBlob((blob) => {
                    getSimilarProducts(blob);
                }, 'image/jpeg', 0.15)
            });

            backButton.addEventListener('click', back, true);
            restartButton.addEventListener('click', reload, true);
        }

        function setUnivers(event) {
            const target = event.target.id;
            switch (target) {
                case 'femme':
                    univers = 'UNV1000001';
                    break;
                case 'homme':
                    univers = 'UNV1000002';
                    break;
                case 'fille':
                    univers = 'UNV1000003';
                    break;
                case 'garcon':
                    univers = 'UNV1000004';
                    break;
                case 'bebe':
                    univers = 'UNV1000005';
                    break;
            }
        }

        function clickPictureIconButton() {
            let input = document.createElement('input');
            input.setAttribute('id', 'image-input');
            input.setAttribute('class', 'hidden');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            inputContainer.appendChild(input);
            input.click();
            input.addEventListener('change', () => {
                show(backButton);
                hide(selectUniversContainer);
                hide(pictureIconButton);
                show(cropContainer);
                show(preview);
                previewFile(input);
                show(cropButton);
            });
        }

        function previewFile(input) {
            const file = input.files[0]; //sames as here
            const reader = new FileReader();

            reader.onloadend = function () {
                preview.src = reader.result;
                step++;
                loadCropping();
                inputContainer.reset();
                inputContainer.removeChild(input);
                show(restartButton);
            };

            if (file) {
                reader.readAsDataURL(file); //reads the data as a URL
            } else {
                preview.src = "";
            }
        }

        function loadCropping() {
            const imagePreview = document.getElementById('preview-image');
            cropper = new Cropper(imagePreview, {
                crop: function (e) {
                    console.log(e.detail.x);
                    console.log(e.detail.y);
                    console.log(e.detail.width);
                    console.log(e.detail.height);
                    console.log(e.detail.rotate);
                    console.log(e.detail.scaleX);
                    console.log(e.detail.scaleY);
                }
            });
        }

        function show(el) {
            el.classList.remove('hidden');
        }

        function hide(el) {
            el.classList.add('hidden');
        }

        function getSimilarProducts(blob) {
            hide(optionContainer);
            show(loader);
            let formData = new FormData();
            formData.append('file', blob);
            const url = `https://api.kiabi.com/v1/recommendations?universe=${univers}`;

            axios.post(url, formData).then((response) => {
                getPictures(response.data.result);
            });
        }

        function getPictures(datas) {
            hide(croppedImage);
            show(resultProducts);
            let resultTitle = document.createElement('h1');
            resultTitle.innerText = 'Résultats de la recherche';
            resultProducts.appendChild(resultTitle);

            datas.forEach((data) => {
                const ref = data[0];
                const formatRef = ref.slice(0, ref.indexOf('_'));
                const preffixRef = ref.slice(0, 2);
                const apiStyleUrl = `https://api.kiabi.com/v1/styles/${formatRef}/commercial_attributes?apikey=83c9d870-469e-11e7-98c3-c2b663306ca5`;
                axios.get(apiStyleUrl).then((style) => {
                    const link = style.data.colorAttributes[0].webSiteLinks[0].url;
                    const shortTitle = style.data.colorAttributes[0].shortTitle;
                    let pictureUrl = `https://cdn.kiabi.com/productpictures/${preffixRef}/${formatRef}/${ref}_PR1.jpg?apikey=MOKA`;

                    let newImg = document.createElement('img');
                    newImg.setAttribute('id', formatRef);
                    newImg.setAttribute('class', 'result-image');
                    newImg.setAttribute('alt', formatRef);
                    newImg.setAttribute('src', pictureUrl);

                    let card = document.createElement('div');
                    card.setAttribute('class', 'my-card');

                    let title = document.createElement('h2');
                    title.innerText = shortTitle;

                    let secondTitle = document.createElement('h4');
                    secondTitle.setAttribute('style', 'margin-top:0');
                    secondTitle.innerText = formatRef;

                    let indiceSimilarité = document.createElement('h3');
                    indiceSimilarité.innerText = `Indice: ${data[1].toFixed(3)}`;

                    let websiteLinkButton = document.createElement('button');
                    websiteLinkButton.setAttribute('class', 'mdc-button secondary-text-button mdc-button--raised');
                    websiteLinkButton.setAttribute('style', 'color: white; background-color: #3F50B2')
                    websiteLinkButton.addEventListener('click', () => window.open(link,'_blank'));
                    websiteLinkButton.innerText = `Lien vers le site`;

                    resultProducts.appendChild(card);
                    card.appendChild(newImg);
                    card.appendChild(title);
                    card.appendChild(secondTitle);
                    card.appendChild(websiteLinkButton);
                })
            });

            hide(loader);
            show(optionContainer);
            step++;
        }

        function back() {
            if(step === 1) {
                reload();
            } else if (step === 2) {
                show(cropContainer);
                show(cropButton);
                hide(resultProducts);
                hide(restartButton)
                deleteResultProductsChildren();
                step--;
            }
        }

        function deleteResultProductsChildren() {
            resultProducts.childNodes.forEach(node => resultProducts.removeChild(node));
        }

        function reload() {
            window.location.reload();
        }
    }
})();