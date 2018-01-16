(function () {
    'use strict';

    const Cropper = window.Cropper;

    window.onload = () => {
        console.log('Application loaded !');

        const imageInput = document.getElementById('image-input');
        const takePictureButton = document.getElementById('take-picutre');
        const takePictureContainer = document.getElementById('take-picture-container');
        const uploadPictureButton = document.getElementById('upload-picture-button');
        const uploadPictureContainer = document.getElementById('upload-picture-container');
        const image = document.getElementById('image');
        const cropButton = document.getElementById('crop-button');
        let croppedImage = document.getElementById('cropped-image');
        const resultPicture = document.getElementById('result-picture');
        const pictureIconButton = document.getElementById('picture-icon-button');
        const preview = document.getElementById('preview-image'); //selects the query named img
        const retakePicture = document.getElementById('retake-picture');
        const cropContainer = document.getElementById('crop-container');
        const inputContainer = document.getElementById('input-container');
        const searchButton = document.getElementById('search-button');
        const croppedPreview = document.getElementById('cropped-preview');
        const resultProducts = document.getElementById('result-products');
        const optionContainer = document.getElementsByClassName('options-container')[0];
        const selectUniversContainer = document.getElementById('select-univers-container');
        const loader = document.getElementById('loader');
        const rbtnFemme = document.getElementById('femme');
        const rbtnHomme = document.getElementById('homme');
        const rbtnFille = document.getElementById('fille');
        const rbtnGarcon = document.getElementById('garcon');
        const rbtnBebe = document.getElementById('bebe');
        let univers = 'UNV1000001';
        let result;
        let cropper;
        let streamVar;

        let streaming = false,
            video = document.querySelector('#video'),
            cover = document.querySelector('#cover'),
            canvas = document.querySelector('#canvas'),
            photo = document.querySelector('#photo'),
            startbutton = document.querySelector('#startbutton'),
            width = 320,
            height = 0;

        hide(preview);

        initEventListeners();


        function initEventListeners() {
            pictureIconButton.addEventListener('click', () => clickPictureIconButton());

            rbtnFemme.addEventListener('change', setUnivers);
            rbtnHomme.addEventListener('change', setUnivers);
            rbtnFille.addEventListener('change', setUnivers);
            rbtnGarcon.addEventListener('change', setUnivers);
            rbtnBebe.addEventListener('change', setUnivers);

            retakePicture.addEventListener('click', () => {
                location.reload();
            });

            cropButton.addEventListener('click', () => {
                result = cropper.getCroppedCanvas();
                croppedImage.appendChild(result);
                hide(cropContainer);
                hide(cropButton);
                show(retakePicture);
                // show(searchButton);
                result.toBlob((blob) => {
                    getSimilarProducts(blob);
                }, 'image/jpeg', 0.15)
            });

            searchButton.addEventListener('click', () => {
                const canvas = document.getElementsByTagName('canvas')[0];
                canvas.toBlob((blob) => {
                    getSimilarProducts(blob);
                }, 'image/jpeg', 0.15)
            })
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
                hide(selectUniversContainer);
                hide(pictureIconButton);
                show(cropContainer);
                show(preview);
                previewFile(input);
                show(cropButton);
                show(retakePicture);
            });
        }

        function loadCamera() {
            navigator.getMedia = (navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia);

            navigator.getMedia(
                {
                    video: true,
                    audio: false
                },
                (stream) => {
                    streamVar = stream;
                    if (navigator.mozGetUserMedia) {
                        video.mozSrcObject = stream;
                    } else {
                        var vendorURL = window.URL || window.webkitURL;
                        video.src = vendorURL.createObjectURL(stream);
                    }
                    video.play();
                },
                (err) => {
                    console.log("An error occured! " + err);
                }
            );
        }

        function previewFile(input) {
            const file = input.files[0]; //sames as here
            const reader = new FileReader();

            reader.onloadend = function () {
                preview.src = reader.result;
                loadCropping();
            };

            if (file) {
                reader.readAsDataURL(file); //reads the data as a URL
            } else {
                preview.src = "";
            }
        }

        function takepicture() {
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(video, 0, 0, width, height);
            let data = canvas.toDataURL('image/png');
            photo.setAttribute('src', data);
            loadCropping(photo);
            show(cropButton);
            hide(takePictureContainer);
            show(resultPicture);
            streamVar.getTracks().forEach(track => track.stop());
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
            // const canvas = document.getElementsByTagName('canvas')[0];
            // const img = new Image();
            // img.onloadend = () => {
            //     imc.src = canvas.toDataURL();
            // }
            // const blob = canvas.toBlob();
            let formData = new FormData();
            formData.append('file', blob);
            const url = `https://api.kiabi.com/v1/recommendations?universe=${univers}`;

            axios.post(url, formData).then((response) => {
                getPictures(response.data.result);
            });
        }

        function getPictures(datas) {
            const products = [];
            hide(croppedImage);
            hide(searchButton);
            datas.forEach((data) => {
                const ref = data[0];
                const formatRef = ref.slice(0, ref.indexOf('_'));
                const preffixRef = ref.slice(0, 2);
                let pictureUrl = `https://cdn.kiabi.com/productpictures/${preffixRef}/${formatRef}/${ref}_PR1.jpg?apikey=MOKA`

                let newImg = document.createElement('img');
                newImg.setAttribute('id', formatRef);
                newImg.setAttribute('class', 'result-image');
                newImg.setAttribute('alt', formatRef);
                newImg.setAttribute('src', pictureUrl);

                let card = document.createElement('div');
                card.setAttribute('class', 'my-card');

                let title = document.createElement('h2');
                title.innerText = formatRef;

                let indiceSimilarité = document.createElement('h3');
                indiceSimilarité.innerText = `Indice: ${data[1].toFixed(3)}`;

                resultProducts.appendChild(card);
                card.appendChild(newImg);
                card.appendChild(title);
                card.appendChild(indiceSimilarité);
            });
            hide(loader);
            show(optionContainer);
        }

    }
})();