// ============================================================================
// AICanScanO Web — Frontend Application Logic
// ============================================================================
// Handles:
//   - File selection (click + drag-and-drop)
//   - Client-side validation (type, size)
//   - Image preview
//   - POST to /analyze
//   - Loading / error / result state rendering
// ============================================================================

(function () {
  'use strict';

  // ---- DOM References ----
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const previewArea = document.getElementById('preview-area');
  const previewImage = document.getElementById('preview-image');
  const removeImageBtn = document.getElementById('remove-image');
  const analyzeBtn = document.getElementById('analyze-btn');
  const btnLabel = analyzeBtn.querySelector('.btn-label');
  const btnSpinner = analyzeBtn.querySelector('.btn-spinner');
  const loadingState = document.getElementById('loading-state');
  const resultsCard = document.getElementById('results-card');
  const errorState = document.getElementById('error-state');
  const errorMessage = document.getElementById('error-message');
  const newScanBtn = document.getElementById('resetBtn') || document.getElementById('new-scan-btn');
  const errorRetryBtn = document.getElementById('error-retry-btn');

  // Result elements
  const riskBadge = document.getElementById('riskBadge') || document.getElementById('risk-badge');
  const disclaimerText = document.getElementById('disclaimerText');

  let selectedFile = null;

  // ---- Constants ----
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  // ---- File Selection ----

  // Click on drop zone triggers file input
  dropZone.addEventListener('click', (e) => {
    if (e.target.tagName === 'LABEL' || e.target.tagName === 'INPUT') return;
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  // Drag and drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  /**
   * Validates and previews the selected file.
   */
  function handleFile(file) {
    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      showError('Please select a JPEG, PNG, or WebP image.');
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      showError('Image is too large. Maximum size is 10 MB.');
      return;
    }

    selectedFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result;
      dropZone.classList.add('hidden');
      previewArea.classList.remove('hidden');
      analyzeBtn.classList.remove('hidden');
      analyzeBtn.disabled = false;

      // Hide previous results/errors
      resultsCard.classList.add('hidden');
      errorState.classList.add('hidden');
    };
    reader.readAsDataURL(file);
  }

  // Remove image
  removeImageBtn.addEventListener('click', resetUpload);

  function resetUpload() {
    selectedFile = null;
    fileInput.value = '';
    previewImage.src = '';
    previewArea.classList.add('hidden');
    analyzeBtn.classList.add('hidden');
    analyzeBtn.disabled = true;
    dropZone.classList.remove('hidden');
    resultsCard.classList.add('hidden');
    errorState.classList.add('hidden');
    loadingState.classList.add('hidden');
    setButtonLoading(false);
  }

  // New scan
  newScanBtn.addEventListener('click', resetUpload);
  errorRetryBtn.addEventListener('click', resetUpload);

  // ---- Analysis ----

  analyzeBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    // Show loading state
    setButtonLoading(true);
    loadingState.classList.remove('hidden');
    resultsCard.classList.add('hidden');
    errorState.classList.add('hidden');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${response.status})`);
      }

      const result = await response.json();
      renderResults(result);
    } catch (err) {
      console.error('Analysis failed:', err);
      showError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setButtonLoading(false);
      loadingState.classList.add('hidden');
    }
  });

  // ---- Rendering ----

  /**
   * Renders the analysis results into the results card.
   */
  function renderResults(data) {
    // Setup Risk Badge (from Clinical Assessment)
    const resultsContent = document.getElementById('resultsContent');
    if (resultsContent) {
      resultsContent.classList.remove('hidden');
    }
    
    const riskLevel = data.clinical_assessment?.risk_level || 'moderate';
    riskBadge.textContent = `${riskLevel.toUpperCase()} RISK`;
    riskBadge.className = 'risk-badge';
    
    if (riskLevel === 'high') {
      riskBadge.classList.add('bg-red');
    } else if (riskLevel === 'moderate') {
      riskBadge.classList.add('bg-yellow');
    } else {
      riskBadge.classList.add('bg-green');
    }

    // Overall Confidence
    const conf = data.ml_confidence_metrics?.overall_confidence || 0;
    document.getElementById('confidenceScore').textContent = `${(conf * 100).toFixed(1)}%`;

    // Clinical Findings & DDx
    document.getElementById('primaryFindingsText').textContent = data.clinical_assessment?.primary_findings || 'No specific findings returned.';
    
    const ddxList = document.getElementById('differentialList');
    ddxList.innerHTML = '';
    const ddx = data.clinical_assessment?.differential_diagnosis || [];
    ddx.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      ddxList.appendChild(li);
    });

    // ML Probabilities
    const probs = data.ml_confidence_metrics?.class_probabilities || {};
    const pNorm = (probs.probability_normal_variant || 0) * 100;
    const pBenign = (probs.probability_benign_lesion || 0) * 100;
    const pOpmd = (probs.probability_opmd || 0) * 100;
    const pMalig = (probs.probability_frank_malignancy || 0) * 100;

    document.getElementById('probNormal').style.width = `${pNorm}%`;
    document.getElementById('valNormal').textContent = `${pNorm.toFixed(1)}%`;
    
    document.getElementById('probBenign').style.width = `${pBenign}%`;
    document.getElementById('valBenign').textContent = `${pBenign.toFixed(1)}%`;
    
    document.getElementById('probOpmd').style.width = `${pOpmd}%`;
    document.getElementById('valOpmd').textContent = `${pOpmd.toFixed(1)}%`;
    
    document.getElementById('probMalignant').style.width = `${pMalig}%`;
    document.getElementById('valMalignant').textContent = `${pMalig.toFixed(1)}%`;

    document.getElementById('imageQualityVal').textContent = data.ml_confidence_metrics?.image_quality_auc_impact || 'N/A';

    // Deployment & Routing
    document.getElementById('triageAction').textContent = data.deployment_and_routing?.recommended_triage_action || 'N/A';
    document.getElementById('referralTime').textContent = data.deployment_and_routing?.target_time_to_referral || 'N/A';
    document.getElementById('clinicalJustification').textContent = data.deployment_and_routing?.clinical_justification || '';
    
    document.getElementById('estNpv').textContent = data.estimated_performance_metrics?.estimated_npv_for_this_case || 'Unknown';
    document.getElementById('perfNote').textContent = data.estimated_performance_metrics?.note || '';

    // Disclaimer
    const disclaimerElem = document.getElementById('disclaimerText');
    if (disclaimerElem && data.disclaimer) {
      disclaimerElem.textContent = data.disclaimer;
    }

    // Show results card
    resultsCard.classList.remove('hidden');

    // Scroll to results
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Shows an error message to the user.
   */
  function showError(message) {
    errorMessage.textContent = message;
    errorState.classList.remove('hidden');
    loadingState.classList.add('hidden');

    errorState.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Toggles the analyze button between normal and loading states.
   */
  function setButtonLoading(loading) {
    if (loading) {
      btnLabel.textContent = 'Analyzing…';
      btnSpinner.classList.remove('hidden');
      analyzeBtn.disabled = true;
    } else {
      btnLabel.textContent = 'Analyze Image';
      btnSpinner.classList.add('hidden');
      analyzeBtn.disabled = false;
    }
  }

  // ---- Smooth scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
})();
