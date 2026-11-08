# citibikeridefetcher
Generates a csv with the last 365 days of rides. Modified from https://www.citibikewrapped.com/

Create a bookmarklet with:
javascript:(function(){const s=document.createElement('script');s.src='https://your-domain.com/fetch-rides.js';document.body.appendChild(s);})();

