(function (global) {

  var dc = {};

  var homeHtmlUrl = "snippets/home-snippet.html";
  var allCategoriesUrl =
    "https://coursera-jhu-default-rtdb.firebaseio.com/categories.json";
  var categoriesTitleHtml = "snippets/categories-title-snippet.html";
  var categoryHtml = "snippets/category-snippet.html";
  var menuItemsUrl =
    "https://coursera-jhu-default-rtdb.firebaseio.com/menu_items/{{short_name}}.json";
  var menuItemsTitleHtml = "snippets/menu-items-title.html";
  var menuItemHtml = "snippets/menu-item.html";

  // Convenience function for inserting innerHTML for 'selector'
  var insertHtml = function (selector, html) {
    var targetElem = document.querySelector(selector);
    targetElem.innerHTML = html;
  };

  // Show loading icon inside element identified by 'selector'.
  var showLoading = function (selector) {
    var html = "<div class='text-center'>";
    html += "<img src='images/ajax-loader.gif'></div>";
    insertHtml(selector, html);
  };

  // Return substitute of '{{propName}}' with propValue in given 'string'
  var insertProperty = function (string, propName, propValue) {
    var propToReplace = "{{" + propName + "}}";
    var result = string.replace(new RegExp(propToReplace, "g"), propValue);
    return result;
  };

  // Remove the class 'active' from home and switch to Menu button
  var switchMenuToActive = function () {
    // Remove 'active' from home button
    var classes = document.querySelector("#navHomeButton").className;
    classes = classes.replace(new RegExp("active", "g"), "");
    document.querySelector("#navHomeButton").className = classes;

    // Add 'active' to menu button if not already there
    classes = document.querySelector("#navMenuButton").className;
    if (classes.indexOf("active") === -1) {
      classes += " active";
      document.querySelector("#navMenuButton").className = classes;
    }
  };

  // On page load (before images or CSS)
  document.addEventListener("DOMContentLoaded", function (event) {
    showLoading("#main-content");

    $ajaxUtils.sendGetRequest(allCategoriesUrl, function (categories) {
      $ajaxUtils.sendGetRequest(homeHtmlUrl, function (homeHtml) {
        // Choose random category
        var randomIndex = Math.floor(Math.random() * categories.length);
        var randomCategory = categories[randomIndex].short_name;

        // Replace {{randomCategoryShortName}} with actual value
        var updatedHtml = insertProperty(
          homeHtml,
          "randomCategoryShortName",
          "'" + randomCategory + "'"
        );
        insertHtml("#main-content", updatedHtml);
      }, false);
    });
  });

  dc.loadMenuCategories = function () {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowCategoriesHTML);
  };

  function buildAndShowCategoriesHTML(categories) {
    $ajaxUtils.sendGetRequest(categoriesTitleHtml, function (categoriesTitleHtml) {
      $ajaxUtils.sendGetRequest(categoryHtml, function (categoryHtml) {
        var categoriesViewHtml =
          buildCategoriesViewHtml(categories, categoriesTitleHtml, categoryHtml);
        insertHtml("#main-content", categoriesViewHtml);
      }, false);
    }, false);
  }

  function buildCategoriesViewHtml(categories, categoriesTitleHtml, categoryHtml) {
    var finalHtml = categoriesTitleHtml;
    finalHtml += "<section class='row'>";

    for (var i = 0; i < categories.length; i++) {
      var html = categoryHtml;
      var name = "" + categories[i].name;
      var short_name = categories[i].short_name;
      html = insertProperty(html, "name", name);
      html = insertProperty(html, "short_name", short_name);
      finalHtml += html;
    }

    finalHtml += "</section>";
    return finalHtml;
  }

  dc.loadMenuItems = function (categoryShort) {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      menuItemsUrl.replace("{{short_name}}", categoryShort),
      buildAndShowMenuItemsHTML
    );
  };

  function buildAndShowMenuItemsHTML(categoryMenuItems) {
    $ajaxUtils.sendGetRequest(menuItemsTitleHtml, function (menuItemsTitleHtml) {
      $ajaxUtils.sendGetRequest(menuItemHtml, function (menuItemHtml) {
        var menuItemsViewHtml = buildMenuItemsViewHtml(
          categoryMenuItems,
          menuItemsTitleHtml,
          menuItemHtml
        );
        insertHtml("#main-content", menuItemsViewHtml);
      }, false);
    }, false);
  }

  function buildMenuItemsViewHtml(categoryMenuItems, menuItemsTitleHtml, menuItemHtml) {
    menuItemsTitleHtml = insertProperty(
      menuItemsTitleHtml,
      "name",
      categoryMenuItems.category.name
    );
    menuItemsTitleHtml = insertProperty(
      menuItemsTitleHtml,
      "special_instructions",
      categoryMenuItems.category.special_instructions
    );

    var finalHtml = menuItemsTitleHtml;
    finalHtml += "<section class='row'>";

    var menuItems = categoryMenuItems.menu_items;
    for (var i = 0; i < menuItems.length; i++) {
      var html = menuItemHtml;
      var name = "" + menuItems[i].name;
      var short_name = menuItems[i].short_name;
      var description = menuItems[i].description;

      html = insertProperty(html, "short_name", short_name);
      html = insertProperty(html, "name", name);
      html = insertProperty(html, "description", description);

      finalHtml += html;
    }

    finalHtml += "</section>";
    return finalHtml;
  }

  global.$dc = dc;

})(window);
