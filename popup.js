document.addEventListener('DOMContentLoaded', () => {
    const petTypes = ["KOKO", "kaitom","kaotung" ,"kaitoon"];
    let currentIndex = 0;

    const inputs = {
        enabled: document.getElementById('enabled'),
        scale: document.getElementById('scale'),
        speed: document.getElementById('speed'),
        distance: document.getElementById('distance')
    };
    
    const previewImg = document.getElementById('preview-img');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const petName = document.getElementById('pet-name');
    const resetBtn = document.getElementById('reset-btn');

    function updatePetPreview() {
        const type = petTypes[currentIndex];
        if (previewImg) {
            previewImg.src = chrome.runtime.getURL(`assets/${type}/icon.PNG`);
        }
        if (petName) {
            petName.textContent = type; 
        }
        chrome.storage.local.set({ petType: type });
    }

    chrome.storage.local.get(
        {
            enabled: true,
            scale: 1.00,
            speed: 0.3,
            distance: 34,
            petType: "KOKO" 
        },
        (data) => {
            inputs.enabled.checked = data.enabled;
            inputs.scale.value = data.scale;
            inputs.speed.value = data.speed;
            inputs.distance.value = data.distance;
            
            currentIndex = petTypes.indexOf(data.petType);
            if (currentIndex === -1) currentIndex = 0;
            
            updatePetPreview();
        }
    );

    function save() {
        if (inputs.scale.value === "" || inputs.speed.value === "" || inputs.distance.value === "") {
            return;
        }

        const scale = Math.min(Math.max(parseFloat(inputs.scale.value), 0), 10.0);
        const speed = Math.min(Math.max(parseFloat(inputs.speed.value), 0), 5.0);
        const distance = Math.min(Math.max(parseFloat(inputs.distance.value), 0), 300);

        inputs.scale.value = scale;
        inputs.speed.value = speed;
        inputs.distance.value = distance;

        chrome.storage.local.set({
            enabled: inputs.enabled.checked,
            scale: scale,
            speed: speed,
            distance: distance
        });
    }

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + petTypes.length) % petTypes.length;
        updatePetPreview();
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % petTypes.length;
        updatePetPreview();
    });

    resetBtn.addEventListener('click', () => {
        inputs.scale.value = 1.0;
        inputs.speed.value = 0.3;
        inputs.distance.value = 34;
        save();
    });

    Object.values(inputs).forEach(el => {
        el.addEventListener("input", save);
    });
});