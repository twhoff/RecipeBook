# To Run:

*This app requires mongodb, if not installed, can be installed from [link](https://docs.mongodb.com/manual/installation/ "here")

1) Start mongodb (should be accessbile via "localhost")
    * If you need to change the mongo address see dist/config/config.toml
2) Start the app with "sudo": `sudo ./server`
    * "sudo" is required to start a secure server on port 443 - this serves the API
    * The server is compiled to run on OS X - if you are using another OS, please recompile (I hope the paths won't cause an issue, haven't tested)
3) Browse to `https://localhost:8080`

Thanks :)