***
# stop using ``using``
#### go into ``mongo.ts`` and remove ``[Symbol.dispose]``
#### ``mongo.connect()`` on required component mount and ``mongo.ts`` startup
#### create arr of components that require it in config
#### ``mongo.close()`` on unmount

***
# UI/UX
#### for the love of got make it not look like someone dumped a trash can on the screen (jokes :])