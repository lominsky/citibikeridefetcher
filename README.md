# CitiBike Ride Exporter
Generates a csv with the last 365 days of rides. Modified from https://www.citibikewrapped.com/

1. Create a new bookmark in your bookmarks bar and point the address to:
```javascript
javascript:(function(){const s=document.createElement('script');s.src='https://lominsky.github.io/citibikeridefetcher/fetch.js';document.body.appendChild(s);})();
```
4. Go to the [Ride History](https://account.citibikenyc.com/ride-history) page on your CitiBike account.
5. Click the bookmarklet
