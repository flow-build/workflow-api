window.onload = function () {
  function HideItemsPlugin() {
    return {
      wrapComponents: {
        InfoUrl: () => () => null
      }
    }
  }

  window.ui = SwaggerUIBundle({
    url: '/swagger.yml',
    dom_id: '#swagger-ui',
    deepLinking: true,
    plugins: [HideItemsPlugin]
  })
}
