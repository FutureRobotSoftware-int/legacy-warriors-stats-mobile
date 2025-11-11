<script setup lang="ts">
defineProps({
  showModal: Boolean,
});

const handleClose = () => {
  const popup = document.getElementById("box");

  popup?.classList.remove("modal-open");
};
</script>

<template>
  <div class="modal p-0" id="box">
    <div class="modal-box md:min-w-190">
      <h3 class="font-bold text-lg">ShotBreakdown Chart Behaviour</h3>
      <div class="py-4 space-y-3">
        <p>
          Each chart visualizes every variable involved in a 3-point shot
          attempt from the shooting area to the specific offensive action
          performed.
        </p>
        <p>
          The pie charts have two levels, the outer circle represents the Field
          Goal (FG%) and the inner one the Frequency (how many entries have) of
          that parameter
        </p>
        <p>
          All data is refined and grouped in its respective chart. However, each
          entry remains interconnected, representing an individual shot attempt.
        </p>
        <p>
          You can explore this analysis tool by selecting a
          <strong>mode</strong> or applying custom filters of interest. The
          charts will update dynamically to reflect your selections.
        </p>

        <h4 class="font-semibold mt-4">Available Modes</h4>
        <ul class="list-disc pl-5 space-y-1">
          <li>
            <strong>General:</strong> Default app behaviour. Displays all
            available data without additional filtering.
          </li>
          <li>
            <strong>Most Common:</strong>
            Changes the behaviour of the filtering, now showing the top entries
            for the relevant charts, based on what value is selected.
          </li>
          <li>
            <strong>Least Efficient:</strong> Changes the behaviour of the
            filtering, now showing the least efficient entries for the relevant
            charts, ignoring the ones with low frequency to prevent bias.
          </li>
          <li>
            <strong>Custom:</strong> Activated whenever a user-defined filter is
            applied in any mode.
          </li>
        </ul>

        <h4 class="font-semibold mt-4">Extra Features</h4>
        <ul class="list-disc pl-5 space-y-1">
          <li>
            In the Totals section, you can clear/show specific parameters
            previosly selected.
          </li>
          <li>
            See Footage will expand a video player for all the active entries.
          </li>
        </ul>
      </div>
      <div class="modal-action">
        <button class="btn" @click="handleClose">Close</button>
      </div>
    </div>
  </div>
</template>
