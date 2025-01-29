function refreshMaterializedView(view, button) {
  button.disabled = true;
  fetch('/api/refresh-materialized-view',
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': document.getElementsByName('csrfmiddlewaretoken')[0].value
      },
      method: "POST",
      body: JSON.stringify({
        view: view
      })
    })
    .then(_ => {
      button.disabled = false;
      window.location.reload();
    })
    .catch(error => {
      console.error(error);
      button.disabled = false;
    });

}