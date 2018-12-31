App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Is there an injected web3 instance? 
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider; 
    } else { 
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545'); 
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Comment.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var CommentArtifact = data;
      App.contracts.CommentHandler = TruffleContract(CommentArtifact);
      
      // Set the provider for our contract
      App.contracts.CommentHandler.setProvider(App.web3Provider);
      // Use our contract to retrieve and mark the adopted pets
      return App.SetCommentCount();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-more', App.showMore);
    $(document).on('click', '.btn-add', App.addComment);
    $(document).on('click', '.btn-back', App.backToMainPage);
  },

  SetCommentCount: function(adopters, account) {
    var commentInstance;
    var hotels;
    var HotelCount;
    App.contracts.CommentHandler.deployed().then(function(instance) {
      commentInstance = instance;
      return commentInstance.getHotels.call();
    }).then(function(Hotels) {
      hotels = Hotels;
      return commentInstance.getAllHotelCommentCount.call();
    }).then(function(counts) {
      HotelCount = counts;
      $('#hotelsRow').attr('style', 'display: block;');
      $('#hotelsMore').attr('style', 'display: none;');
      $('#head-title').text('酒店评价');
      $.getJSON('../hotels.json', function(data) {
        var hotelsRow = $('#hotelsRow');
        hotelsRow.empty();
        var hotelTemplate = $('#hotelTemplate');
        for (i = 0; i < data.length; i ++) {
          hotelTemplate.find('.panel-title').text(data[i].name);
          hotelTemplate.find('img').attr('src', data[i].picture);
          hotelTemplate.find('.hotel-location').text(data[i].location);
          hotelTemplate.find('.add-comment').attr('id', 'add-comment-'+data[i].id.toString());
          hotelTemplate.find('.btn-add').attr('data-id', data[i].id.toString());
          hotelTemplate.find('.btn-more').attr('data-id', data[i].id.toString());
          var count = 0;
          for (j = 0; j < hotels.length; j++) {
            if (data[i].id == hotels[j]) {
              count = HotelCount[j];
              break;
            }
          }
          hotelTemplate.find('.hotel-comment-count').text(count);
          hotelsRow.append(hotelTemplate.html());
        }
        return;
      });
    }).catch(function(err) {
      console.log(err.message);
    }); 
  },

  showMore: function(event) {
    var commentInstance;
    var hotelId = parseInt($(event.target).data('id'));
    App.contracts.CommentHandler.deployed().then(function(instance) {
      commentInstance = instance;
      return commentInstance.getAllCommentsOfHotel(hotelId);
    }).then(function(Comments) {
      console.log(Comments.length);
      $.getJSON('../hotels.json', function(data) {
        $('#hotelsRow').attr('style', 'display: none;');
        $('#hotelsMore').attr('style', 'display: block;');
        $('#head-title').text(data[hotelId].name);
        $('#hotelsMore').find('img').attr('src', data[hotelId].picture);
        $('#hotelsMore').find('#comment-location').text(data[hotelId].location);
        var commentsRow = $('#commentsRow');
        commentsRow.empty();
        var commentTemplate = $('#commentTemplate');
        flag = true;
        for (i = 0; i < Comments.length; i++) {
          console.log(Comments[i]);
          if (Comments[i] == " ") continue;
          flag = false;
          commentTemplate.find('.panel-title').text(Comments[i]);
          commentsRow.append(commentTemplate.html());
        }
        if (flag) {
          commentTemplate.find('.panel-title').text("暂时没有评论");
          commentsRow.append(commentTemplate.html());
        }
      });
    }).catch(function(err) {
      console.log(err.message);
    });
  }, 

  addComment: function(event) {
    var hotelId = parseInt($(event.target).data('id'));
    var text;
    $.getJSON('../hotels.json', function(data) {
      text = $('#add-comment-'+data[hotelId].id).val();
    });
    var commentInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.CommentHandler.deployed().then(function(instance) {
        commentInstance = instance;
        console.log(text);
        commentInstance.addComment(hotelId, text);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  backToMainPage: function() {
    return App.SetCommentCount();
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
