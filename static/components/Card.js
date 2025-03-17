const CardComponent = {
  props: ["title"],
  template: `
    <div class="col-md-4">
      <div class="card shadow-sm">
        <div class="card-body">
          <h5 class="card-title">{{ title }}</h5>
          <div class="card-content">
            <slot name="body"></slot> <!-- Dynamic content inside the card -->
          </div>
          <div class="card-footer text-center">
            <slot name="footer"></slot> <!-- Custom footer slot (e.g., buttons) -->
          </div>
        </div>
      </div>
    </div>
  `
};

export default CardComponent;
