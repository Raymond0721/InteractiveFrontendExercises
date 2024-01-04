/*
 * controller.js
 *
 * Write all your code here.
 */



// part 1

$(document).ready(function () {
    $("#username").on("input", validate_username);
    $("#email").on("input", validate_email);
    $("#phone").on("input", validate_phone);
    $("#password1").on("input", function() {
        validate_password();
        validate_repeat_password();
    });
    $("#password2").on("input", validate_repeat_password);


    $("#register").click(function (event) {
        event.preventDefault();
        if (validate_form()) {
            var formData = {
                username: $("#username").val(),
                email: $("#email").val(),
                phone: $("#phone").val(),
                password1: $("#password1").val(),
                password2: $("#password2").val()
            };

            $.ajax({
                url: '/register',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(formData),
                success: function(response) {
                    $("#notification").text("User added"); 
                },
                error: function(xhr) {
                    if (xhr.status === 400) {
                        $("#notification").text("Unknown error occurred"); 
                    } else if (xhr.status === 409) {
                        $("#username_notification").text("Username has already been taken");
                    }
                }
            });            
        } else {
            $("#notification").text("At least one field is invalid. Please correct it before proceeding");
        }
    });
});


// helper function for validate message
function validate_field(input, notification, func, message){
    if (func()) {
        input.css("background-color", "");
        notification.text("");
        return true;
    } else {
        input.css("background-color", "red");
        notification.text(message);
        return false;
    }
}

// username field
function validate_username() {
    var username = $("#username");
    var notification = $("#username_notification");
    var regex = /^[A-Za-z0-9_]{6,}$/;

    return validate_field(
        username,
        notification,
        function(){ return regex.test(username.val());},
        "Username is invalid"
    );
}

// email field
function validate_email() {
    var email = $("#email");
    var notification = $("#email_notification");

    var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    return validate_field(
        email,
        notification,
        function() { 
            return email.val() === "" || (regex.test(email.val()) && !/\.\./.test(email.val()));
        },
        "Email is invalid"
    );
}


// password field
function validate_password() {
    var password = $("#password1"); 
    var notification = $("#password1_notification");

    var regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;

    return validate_field(
        password,
        notification,
        function(){ return regex.test(password.val()); },
        "Password is invalid"
    );
}                                                           

// password2 field
function validate_repeat_password() {
    var repeatPassword = $("#password2"); 
    var password = $("#password1");
    var notification = $("#password2_notification"); 

    return validate_field(
        repeatPassword,
        notification,
        function(){ return repeatPassword.val() === password.val(); },
        "Passwords don't match"
    );
}

// phone field
function validate_phone() {
    var phone = $("#phone"); 
    var notification = $("#phone_notification"); 

    var regex = /^\d{3}-\d{3}-\d{4}$/;

    return validate_field(
        phone,
        notification,
        function() { 
            return phone.val() === "" || regex.test(phone.val()); 
        },
        "Phone is invalid"
    );
}

 
function validate_form() {
    var is_valid = true;
    var notification = $("#notification");

    is_valid = validate_username() && is_valid;
    is_valid = validate_email() && is_valid;
    is_valid = validate_password() && is_valid;
    is_valid = validate_repeat_password() && is_valid;
    is_valid = validate_phone() && is_valid;

    if (!is_valid) {
        notification.text("At least one field is invalid. Please correct it before proceeding");
    } else {
        notification.text("");
    }
    return is_valid;
}



// part 2

$(document).ready(function() {
    // Function to add or update items in the cart
    function addItemToCart(name, price, quantity) {
      let itemId = name.replace(/\s+/g, '_'); // Replace whitespaces with underscores
      let existingItem = $('#cart-items').find('#' + itemId);
      let totalPrice = (price * quantity).toFixed(2);
  
      if (existingItem.length === 0) {
        // Add new item
        let newRow = `<tr id="${itemId}">
          <td> ${name} </td>
          <td> $${price.toFixed(2)} </td>
          <td> ${quantity} </td>
          <td> $${totalPrice} </td>
          <td> <button class="btn decrease"> - </button> </td>
          <td> <button class="btn increase"> + </button> </td>
          <td> <button class="btn delete"> delete </button> </td>
        </tr>`;
        $('#cart-items').append(newRow);
      } else {
        // Update existing item
        existingItem.find('td').eq(1).text(`$${price.toFixed(2)}`);
        existingItem.find('td').eq(2).text(quantity);
        existingItem.find('td').eq(3).text(`$${totalPrice}`);
      }
      
      updateTotals();
    }
  
    // helper function to update subtotal, taxes, and grand total
    function updateTotals() {
        let subtotal = 0;
        $('#cart-items tr').each(function() {
          let priceText = $(this).find('td').eq(1).text();
          let quantityText = $(this).find('td').eq(2).text();
          let price = parseFloat(priceText.replace('$', ''));
          let quantity = parseInt(quantityText);
      
          if (!isNaN(price) && !isNaN(quantity)) {
            subtotal += price * quantity;
          }
        });
      
        let taxes = subtotal * 0.13;
        let grandTotal = subtotal + taxes;
      
        $('#subtotal').text(`$${subtotal.toFixed(2)}`);
        $('#taxes').text(`$${taxes.toFixed(2)}`);
        $('#grand_total').text(`$${grandTotal.toFixed(2)}`);
    }
      
  
    $('#add_update_item').on('click', function() {
      let name = $('#name').val().trim();
      let price = parseFloat($('#price').val());
      let quantity = parseInt($('#quantity').val());
  
      if (!name || isNaN(price) || price < 0 || isNaN(quantity) || quantity < 0 || !Number.isInteger(quantity)) {
        $('#item_notification').text('Name, price, or quantity is invalid');
      } else {
        $('#item_notification').text('');
        addItemToCart(name, price, quantity);

        // Clear the fields
        $('#name').val('');
        $('#price').val('');
        $('#quantity').val('');
      }
    });
  
    $('#cart-items').on('click', '.increase', function() {
        let row = $(this).closest('tr');
        let quantityCell = row.find('td').eq(2);
        let quantity = parseInt(quantityCell.text()) + 1;
        quantityCell.text(quantity);

        let price = parseFloat(row.find('td').eq(1).text().replace('$', ''));
        let totalPrice = (quantity * price).toFixed(2);
        row.find('td').eq(3).text(`$${totalPrice}`);

        updateTotals();
    });

    // Event handler for decrease button
    $('#cart-items').on('click', '.decrease', function() {
        let row = $(this).closest('tr');
        let quantityCell = row.find('td').eq(2);
        let quantity = parseInt(quantityCell.text()) - 1;
        if (quantity < 0) quantity = 0;
        quantityCell.text(quantity);

        let price = parseFloat(row.find('td').eq(1).text().replace('$', ''));
        let totalPrice = (quantity * price).toFixed(2);
        row.find('td').eq(3).text(`$${totalPrice}`);

        updateTotals();
    });

    // Event handler for delete button
    $('#cart-items').on('click', '.delete', function() {
        $(this).closest('tr').remove();
        updateTotals();
    });
});



// part 3

$(document).ready(function() {
    let currentPage = 1;
    let isLoading = false;
    let endOfContent = false;
  
    function fetchAndDisplayParagraphs() {
      if (isLoading || endOfContent) {
        return;
      }
      isLoading = true;
      
      $.ajax({
        url: `/text/data?paragraph=${currentPage}`,
        method: 'GET',
        success: function(response) {
          if (response.data && response.data.length > 0) {
            response.data.forEach(function(paragraph) {
              let paraDiv = $(`<div id="paragraph_${paragraph.paragraph}"></div>`);
              paraDiv.append(`<p>${paragraph.content} <b>(Paragraph: ${paragraph.paragraph})</b></p>`);
              paraDiv.append(`<button class="like" data-paragraph="${paragraph.paragraph}">Likes: ${paragraph.likes}</button>`);
              $('#data').append(paraDiv);
            });
            currentPage += response.data.length;
          } 
          
          if (!response.next) {
            endOfContent = true;
            $('#data').append('<b>You have reached the end.</b>');
          }
          isLoading = false;
        },
        error: function() {
          isLoading = false;
        }
      });
    }
  
    function updateLikes(paragraphId) {
      $.ajax({
        url: '/text/like',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ paragraph: paragraphId }),
        success: function(response) {
          if (response.data && response.data.likes !== undefined) {
            $(`button[data-paragraph=${paragraphId}]`).text(`Likes: ${response.data.likes}`);
          }
        },
        error: function() {
          console.log("Error liking paragraph.");
        }
      });
    }
  
    // Fetch initial paragraphs
    fetchAndDisplayParagraphs();
  
    // Infinite scroll event listener
    $(window).scroll(function() {
      if ($(window).scrollTop() + $(window).height() > $(document).height() - 100 && !isLoading) {
        fetchAndDisplayParagraphs();
      }
    });
  
    // Like button event
    $('#data').on('click', '.like', function() {
      let paragraphId = $(this).data('paragraph');
      updateLikes(paragraphId);
    });
  });
  