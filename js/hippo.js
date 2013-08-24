//
// Constants
//
var URL_API_ROOT;
var DEBUG = true;

function toggleSubscribed(webtoon_id)
{
	var webtoonItem = $("#webtoon-item-" + webtoon_id);
	var button = $("#webtoon-item-" + webtoon_id + " .btn-subscribe");
	var subscribed = button.attr("hippo-subscribed") === "true";
	button.button('loading');

	$.ajax({
		url: URL_API_ROOT + "webtoon/" + webtoon_id + "/subscribe",
		type: subscribed ? "DELETE" : "POST",
		success: function(data) {
			updateSubscribeButton(button, !subscribed);
		},
		error: function(data) {
			button.button('reset');
		}
	});
}

function updateSubscribeButton(button, subscribed)
{
	button.button('reset');

	if( !subscribed )
	{
		button.removeClass("btn-danger");
		button.addClass("btn-info");
		button.text('구독하기');
	}
	else
	{
		button.removeClass("btn-info");
		button.addClass("btn-danger");
		button.text('구독취소');
	}

	button.attr("hippo-subscribed", subscribed);
}

function read(episode_id)
{
	var item = $("#episode-item-" + episode_id);
	var thumbnail = $("#episode-thumbnail-" + episode_id);
	var bookmark = $("#episode-bookmark-" + episode_id);
	var title = $("#episode-title-" + episode_id);

	$.ajax({
		url: URL_API_ROOT + "episode/" + episode_id + "/read",
		type: "POST",
		success: function(data) {
			item.attr("hippo-read", true);
			thumbnail.addClass("grayscale");
			title.addClass("text-muted");

			$(".glyphicon-bookmark").css("display", "none");
			bookmark.css("display", "");
		}
	});
	return true;
}


/*
ko.bindingHandlers.runafter = {
    update: function(element, valueAccessor, allBindingsAccessor) {
        // add dependency on all other bindings
        ko.toJS(allBindingsAccessor());
        setTimeout(function() {
            var value = valueAccessor();
            if (typeof value != 'function' || ko.isObservable(value))
                throw new Error('run must be used with a function');
            value(element);
        });
    }
};

function HippoViewModel() {
	var self = this;
	self.options = [{ name: '전체', value: 'all' },
					{ name: '월요일', value: 'mon' },
					{ name: '화요일', value: 'tue' },
					{ name: '수요일', value: 'wed' },
					{ name: '목요일', value: 'thu' },
					{ name: '금요일', value: 'fri' },
					{ name: '토요일', value: 'sat' },
					{ name: '일요일', value: 'sun' },
					{ name: '완결', value: 'fin' }];
	self.option = ko.observable('me');
	
	self.allWebtoons = ko.observableArray();
	self.webtoons = ko.observableArray(); // Selected(viewing) webtoons

	self.webtoon = ko.observable(); // Selected webtoon
	self.episodes = ko.observable(); // Selected webtoon's episode
	self.bookmark = ko.observable();

	self.loading = ko.observable();

	self.search = function() {
		var query = $("#searchInput").val();
		if( !query ) {
			self.filterWebtoons();
			return;
		}
		var allWebtoons = self.allWebtoons();
		var filteredWebtoons = ko.observableArray();
		for( var i in allWebtoons )
		{
			var webtoon = allWebtoons[i];
			
			var matchArtist = false;
			var artists = webtoon.artists();
			for( var j = 0; j < artists.length; j++ )
			{
				var artist = artists[j];
				if( artist.name().indexOf(query) > -1 ) {
					matchArtist = true;
					break;
				}
			}
			if( webtoon.title().indexOf(query) > -1 || matchArtist ) {
				filteredWebtoons.push(webtoon);
			}
		}
		self.webtoons(filteredWebtoons);
	};

	self.subscribe = function() {
		var webtoon = this;
		$.post(URL_API_ROOT + "webtoon/" + webtoon.id() + "/subscribe", function(data) {
			webtoon.subscribed( true );
			log(webtoon);
		})
		.fail(function(data) {
			webtoon.subscribed( false );
		});
	};

	self.unsubscribe = function() {
		var webtoon = this;
		$.ajax({
			url: URL_API_ROOT + "webtoon/" + webtoon.id() + "/subscribe",
			type: "DELETE",
			success: function(data) {
				webtoon.subscribed( false );
			},
			error: function(data) {
				webtoon.subscribed( true );
			}
		});
	};

	self.read = function() {
		var episode = this;
		$.ajax({
			url: URL_API_ROOT + "episode/" + episode.id() + "/read",
			type: "POST",
			success: function(data) {
				episode.read( true );
				self.bookmark( episode.id() );
			}
		});
		return true;
	};
	
	self.renderComplete = function(elem) {
		if( $(elem).children().length ) {
			$("img.async").loadasync();
			$(".hippo-img").hover(
				function() {
					log('hover');
					$(".hippo-over", this).animate({opacity: 1}, 200);
				},
				function() {
					$(".hippo-over", this).animate({opacity: 0}, 200);
				}
			);
		}
	};
	self.filterWebtoons = function(option) {
		if( !option ) option = self.option();
		var allWebtoons = self.allWebtoons();
		var filteredWebtoons = ko.observableArray();
		switch(option)
		{
			case 'me':
				for( var i in allWebtoons )
				{
					var webtoon = allWebtoons[i];
					if( webtoon.subscribed() )
						filteredWebtoons.push( webtoon );
				}
				break;
			case 'all':
				filteredWebtoons = allWebtoons;
				break;
				
			default:
				for( i in allWebtoons )
				{
					var webtoon = allWebtoons[i];
					if( webtoon[option]() )
						filteredWebtoons.push( webtoon );
				}
				break;
		}
		self.webtoons(filteredWebtoons);
	};
	self.loadAllWebtoons = function(callback) {
		if( !self.allWebtoons().length )
		{
			log("Loading webtoons...");
			$.get(URL_API_ROOT + "webtoons", function(data) {
				self.allWebtoons = ko.mapping.fromJS(data);
				log("Loaded " + self.allWebtoons().length + " webtoons.");
				callback();
			});
			return false;
		}
		else
		{
			callback();
		}
		return true;
	};
	self.getWebtoonWeekday = function(webtoon) {
		weekdays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
		for( i in weekdays ) {
			var weekday = weekdays[i];
			if( webtoon[weekday] )
				return weekday;
		}
		return 'mon';
	};
	
	Sammy(function() {
		this.get("/", function() {
			if( !location.hash )
				location.hash = "#all";
		});
		
		this.get("#:weekday", function() {
			self.loading(true);
			var weekday = this.params.weekday;
			self.loadAllWebtoons(function() {
				self.weekday(weekday);
				self.filterWebtoons(weekday);
				self.webtoon(null);
				self.episodes(null);
				self.loading(false);
			});
		});
		
		this.get("#webtoon/:webtoonId", function() {
			self.loading(true);
			var webtoonId = parseInt(this.params.webtoonId);
			var weekday = this.params.weekday;
			self.loadAllWebtoons(function() {
				self.webtoons(null);
				self.webtoon(self.allWebtoons()[webtoonId - 1]);
				if( !weekday ) weekday = self.getWebtoonWeekday(self.webtoon);
				self.weekday(weekday);

				log("Loading episodes...");
				$.get(URL_API_ROOT + "webtoon/" + webtoonId + "/episodes", function(data) {
					self.episodes( ko.mapping.fromJS(data['data']) );
					self.bookmark( data['bookmark'] );
					log("Loaded " + self.episodes().length + " episodes.");
					log('bookmark : ' + self.bookmark());
					self.loading(false);
				});
			});
		});
	}).run("#all");
}
*/
// ko.applyBindings(new HippoViewModel());

// $(".spinner").spin();

$("img.async").loadasync();

$(document).scroll(function() {
	var nav = $('.hippo-weekday-nav');
	if( !nav.attr('data-top') )
	{
		if( nav.hasClass('navbar-fixed-top') )
			return;
		var offset = nav.offset();
		nav.attr('data-top', offset.top);
	}
	if (nav.attr('data-top') <= $(this).scrollTop() )
	{
		nav.addClass('navbar-fixed-top');
		$("#content").css('padding-top', '70px');
	}
	else
	{
		nav.removeClass('navbar-fixed-top');
		$("#content").css('padding-top', '20px');
	}
} );

// $("#searchInput").typehead([
// 	{
// 		remote: 
// 	}
// ]);

function log( msg )
{
	if( DEBUG ) console.log( msg );
}