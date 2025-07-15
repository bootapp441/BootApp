document.addEventListener('DOMContentLoaded', function () {
    $(document).ready(function () {
        // Create the button and append it to the page
        var carCharTab = `
                <div style="display: flex; gap: 6px; align-items: center;">        
                    <br><br>
                    <span style="font-size: 10pt; background-color: #a12c13; color: white; font-weight: bold; padding: 0px 5px; border: 1px solid white; border-radius: 10px; cursor: pointer;" 
                        class="select-hot-cars">
                        Hot
                    </span>
                    <br><br>
                    <span style="font-size: 10pt; background-color: #a12c13; color: white; font-weight: bold; padding: 0px 5px; border: 1px solid white; border-radius: 10px; cursor: pointer;" 
                        class="select-repair">
                        Repair
                    </span>
                    <br><br>
                    <span style="font-size: 10pt; background-color: #a12c13; color: white; font-weight: bold; padding: 0px 5px; border: 1px solid white; border-radius: 10px; cursor: pointer;" 
                        class="select-ship">
                        Ship
                    </span>
                    <br><br>
                    <span style="font-size: 10pt; background-color: #a12c13; color: white; font-weight: bold; padding: 0px 5px; border: 1px solid white; border-radius: 10px; cursor: pointer;" 
                        class="select-sell">
                        Sell
                    </span>
                    <br><br>
                </div>
            `;
        $('.panel-car-listing').append(carCharTab);
        console.log("Select buttons added to the options section in Character menu only.");

        // SELL SELL SELL SELL SELL SELL SELL SELL SELL SELL SELL SELL SELL SELL 
        // Add click event listener for the span
        $('.select-sell').click(function () {
            // First, click the "Select car(s)" div
            $('.select-button:contains("Select car(s)")').trigger('click');
            console.log('"Select car(s)" button clicked.');

            // After 1 second, continue selecting the cars
            setTimeout(function () {
                $('.cars-listing .car').each(function () {
                    // Get car name
                    var carName = $(this).find('.car-info .name').text().trim();

                    // Get the class of the progress bar inside the plate-container
                    var progressBarClass = $(this).find('.plate-container .BL-progress-bar').attr('class');

                    // Check exclusion criteria
                    if (
                        !$(this).hasClass('is-driving') && // Not currently driving
                        !$(this).hasClass('is-garaged') && // Not garaged
                        !$(this).hasClass('in-transit') && // Not in transit
                        carName !== 'Hearse' &&
                        carName !== 'Milk Truck' &&
                        carName !== 'School Bus' &&
                        carName !== 'Porter Model 1 Closed Cab' &&
                        carName !== 'Rosenberg Type RS Phaeton LaRue' &&
                        progressBarClass === 'BL-progress-bar inventory-bar mini-bar' // Exact class match
                    ) {
                        // Trigger a click event on the corresponding 'main-side BL-content BL-content-inner' element
                        $(this).find('.main-side.BL-content.BL-content-inner').trigger('click');
                        setTimeout(function () {
                            $('.button-group .car-action-button[data-action="sell"]').trigger('click');
                            console.log('"Sell" button clicked for selected cars.');
                            setTimeout(function () {
                                // $('.dialog .buttons .do-button[value="Do it!"]').trigger('click');
                            }, 600);
                        }, 600);
                    }
                });
                console.log("Click event triggered on all cars to be shipped.");
            }, 600); 
        });

        // TRANSPORT TRANSPORT TRANSPORT TRANSPORT TRANSPORT TRANSPORT TRANSPORT
        // Add click event listener for the span
        $('.select-ship').click(function () {
            // First, click the "Select car(s)" div
            $('.select-button:contains("Select car(s)")').trigger('click');
            console.log('"Select car(s)" button clicked.');

            // After 1 second, continue selecting the cars
            setTimeout(function () {
                $('.cars-listing .car').each(function () {
                    // Get car name
                    var carName = $(this).find('.car-info .name').text().trim();

                    // Get the class of the progress bar inside the plate-container
                    var progressBarClass = $(this).find('.plate-container .BL-progress-bar').attr('class');

                    // Check exclusion criteria
                    if (
                        !$(this).hasClass('is-driving') && // Not currently driving
                        !$(this).hasClass('is-garaged') && // Not garaged
                        !$(this).hasClass('in-transit') && // Not in transit
                        carName !== 'Hearse' &&
                        carName !== 'Milk Truck' &&
                        carName !== 'School Bus' &&
                        carName !== 'Porter Model 1 Closed Cab' &&
                        carName !== 'Rosenberg Type RS Phaeton LaRue' &&
                        progressBarClass === 'BL-progress-bar inventory-bar mini-bar' // Exact class match
                    ) {
                        // Trigger click event on the corresponding 'main-side BL-content BL-content-inner' element
                        $(this).find('.main-side.BL-content.BL-content-inner').trigger('click');
                        setTimeout(function () {
                            $('.icon-button.car-action-button[data-action="ship"]').trigger('click');
                            console.log('"Ship" button clicked for selected cars.');
                        }, 600);
                    }
                });
                console.log("Click event triggered on all cars to be shipped.");
            }, 600); 
        });

        // HOT HOT HOT HOT HOT HOT HOT HOT HOT HOT HOT HOT HOT HOT HOT HOT HOT 
        // Add click event listener for the "Hot Cars" button
        $('.select-hot-cars').click(function () {
            // First, click the "Select car(s)" div
            $('.select-button:contains("Select car(s)")').trigger('click');
            console.log('"Select car(s)" button clicked.');

            // After 1 second, continue selecting the cars
            setTimeout(function () {
                $('.cars-listing .car').each(function () {
                    // Check if the car contains the "car-plate is-hot" class
                    if ($(this).find('.car-plate.is-hot').length > 0) {
                        
                        // Check exclusion criteria
                        if (
                            !$(this).hasClass('in-transit') // Not in transit
                        ) {
                            // Trigger a click event on the corresponding 'main-side BL-content BL-content-inner' element
                            $(this).find('.main-side.BL-content.BL-content-inner').trigger('click');
                            setTimeout(function () {
                                $('.button-group .car-action-button[data-action="plates"]').trigger('click');
                                console.log('"Plates" button clicked for selected cars.');
                                setTimeout(function () {
                                    $('.dialog .buttons .do-button[value="Do it!"]').trigger('click');
                                }, 600);
                            }, 600);
                        }
                    }
                });
                console.log("Click event triggered on all hot cars.");
            }, 600);
        });

        // REPAIR REPAIR REPAIR REPAIR REPAIR REPAIR REPAIR REPAIR REPAIR REPAIR 
        // Add click event listener for the "Repair Cars" button
        $('.select-repair').click(function () {
            // First, click the "Select car(s)" div
            $('.select-button:contains("Select car(s)")').trigger('click');
            console.log('"Select car(s)" button clicked.');

            setTimeout(function () {
                $('.cars-listing .car').each(function () {
                    // Check if the car contains the "damage" class and damage is greater than 0%
                    const damageText = $(this).find('.damage').text().trim(); // Get the text inside .damage
                    const damageMatch = damageText.match(/\((\d+)%\)/); // Extract the percentage value
                
                    if (damageMatch && parseInt(damageMatch[1]) > 0) {
                        // Check exclusion criteria
                        if (
                            !$(this).hasClass('in-transit') // Not in transit
                        ) { 
                            // Trigger a click event on the corresponding 'main-side BL-content BL-content-inner' element
                            $(this).find('.main-side.BL-content.BL-content-inner').trigger('click');
                            
                            setTimeout(function () {
                                $('.button-group .car-action-button[data-action="repair"]').trigger('click');
                                console.log('"Repair" button clicked for selected cars.');
                
                                setTimeout(function () {
                                    $('.dialog .buttons .do-button[value="Do it!"]').trigger('click');
                                }, 600);
                            }, 600);
                        }
                    }
                });
                console.log("Click event triggered on all cars needing repair.");                
            }, 600);
        });
    });
});
