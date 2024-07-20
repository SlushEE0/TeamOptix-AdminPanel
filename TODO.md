***
# stop using ``using``
#### go into ``mongo.ts`` and remove ``[Symbol.dispose]``
#### ``mongo.connect()`` on required component mount and ``mongo.ts`` startup
#### create arr of components that require it in config
#### ``mongo.close()`` on unmount

***


TODO:
-
- Create User
- Walkthrough whole app, try to break it yourself

### After That ...

- Create Docker file
- Think about deployment