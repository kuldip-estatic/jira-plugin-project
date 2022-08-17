export default function routes(app, addon) {
  app.get("/", (req, res) => {
    res.redirect("/atlassian-connect.json");
  });
  app.get("/hello-world", addon.authenticate(), (req, res) => {
    var httpClient = addon.httpClient(req);
    let statusDetails;
    httpClient.get(
      "/rest/api/3/statuses/search",
      function (error, response, details) {
        details = JSON.parse(response.body);
        statusDetails = details.values;
      }
    );
    httpClient.get(
      "/rest/api/2/search?expand=names&&maxResults=10000",
      function (err, resp, data) {
        try {
          data = JSON.parse(resp.body);
          res.render("hello-world.jsx", {
            title: "Atlassian Connect",
            data: data.issues,
            statusDetail: statusDetails,
            names: data.names,
          });
        } catch (e) {
          console.log(e);
        }
      }
    );
  });
}
