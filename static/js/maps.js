// EcoBeach - Google Maps Integration

let map = null;
let markers = [];
let infoWindow = null;
let userLocation = null;
let activeFilter = 'todos';

// Map configuration
const mapConfig = {
    center: { lat: -18.7167, lng: -39.8567 }, // Guriri coordinates
    zoom: 13,
    styles: [
        {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#4a90a4' }]
        },
        {
            featureType: 'landscape.natural',
            elementType: 'geometry.fill',
            stylers: [{ color: '#f4f1e8' }]
        }
    ]
};

// Safe btoa function for UTF-8
function safeBtoa(str) {
    try {
        return btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
        console.warn('Error encoding string:', e);
        return '';
    }
}

// Marker icons configuration
const markerIcons = {
    turisticos: {
        url: 'data:image/svg+xml;base64,' + safeBtoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="#28a745" stroke="white" stroke-width="3"/>
                <circle cx="20" cy="17" r="8" fill="white"/>
                <circle cx="20" cy="17" r="5" fill="#28a745"/>
            </svg>
        `),
        scaledSize: { width: 40, height: 40 }
    },
    restaurantes: {
        url: 'data:image/svg+xml;base64,' + safeBtoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="#ffc107" stroke="white" stroke-width="3"/>
                <rect x="14" y="13" width="12" height="8" rx="2" fill="white"/>
                <circle cx="16" cy="16" r="1" fill="#ffc107"/>
                <circle cx="20" cy="16" r="1" fill="#ffc107"/>
                <circle cx="24" cy="16" r="1" fill="#ffc107"/>
            </svg>
        `),
        scaledSize: { width: 40, height: 40 }
    },
    hoteis: {
        url: 'data:image/svg+xml;base64,' + safeBtoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="#17a2b8" stroke="white" stroke-width="3"/>
                <rect x="12" y="12" width="16" height="12" rx="2" fill="white"/>
                <rect x="14" y="14" width="4" height="4" fill="#17a2b8"/>
                <rect x="22" y="14" width="4" height="4" fill="#17a2b8"/>
                <rect x="14" y="18" width="4" height="4" fill="#17a2b8"/>
                <rect x="22" y="18" width="4" height="4" fill="#17a2b8"/>
            </svg>
        `),
        scaledSize: { width: 40, height: 40 }
    },
    preservacao: {
        url: 'data:image/svg+xml;base64,' + safeBtoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="#dc3545" stroke="white" stroke-width="3"/>
                <polygon points="20,10 18,16 12,16 16.5,20 14.5,26 20,22 25.5,26 23.5,20 28,16 22,16" fill="white"/>
            </svg>
        `),
        scaledSize: { width: 40, height: 40 }
    },
    servicos: {
        url: 'data:image/svg+xml;base64,' + safeBtoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="#6c757d" stroke="white" stroke-width="3"/>
                <rect x="12" y="18" width="16" height="4" rx="2" fill="white"/>
                <circle cx="15" cy="13" r="2" fill="white"/>
                <circle cx="25" cy="27" r="2" fill="white"/>
            </svg>
        `),
        scaledSize: { width: 40, height: 40 }
    }
};

// Initialize the map
function initializeMap(pointsData = []) {
    try {
        // Check if Google Maps is available
        if (typeof google === 'undefined' || !google.maps) {
            throw new Error('Google Maps API not loaded');
        }
        
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            throw new Error('Map element not found');
        }
        
        // Create map instance
        map = new google.maps.Map(mapElement, mapConfig);
        
        // Create info window
        infoWindow = new google.maps.InfoWindow();
        
        // Load points data
        if (pointsData && pointsData.length > 0) {
            loadMapPoints(pointsData);
        } else {
            console.warn('No points data provided');
        }
        
        // Setup map controls
        setupMapControls();
        
        // Get user location
        getUserLocation();
        
        console.log('Map initialized successfully with', pointsData?.length || 0, 'points');
        
    } catch (error) {
        console.error('Error initializing map:', error);
        showMapError();
    }
}

// Load points onto the map
function loadMapPoints(pointsData) {
    // Clear existing markers
    clearMarkers();
    
    pointsData.forEach(point => {
        createMarker(point);
    });
    
    // Update points list
    updatePointsList(pointsData);
}

// Create a marker for a point
function createMarker(point) {
    const marker = new google.maps.Marker({
        position: { lat: point.lat, lng: point.lng },
        map: map,
        title: point.nome,
        icon: markerIcons[point.categoria] || markerIcons.turisticos,
        animation: google.maps.Animation.DROP
    });
    
    // Create info window content
    const infoContent = createInfoWindowContent(point);
    
    // Add click listener
    marker.addListener('click', () => {
        infoWindow.setContent(infoContent);
        infoWindow.open(map, marker);
        
        // Update side panel
        updateSelectedPointInfo(point);
        
        // Track marker click
        if (window.EcoBeach) {
            window.EcoBeach.trackEvent('map', 'marker_click', point.nome);
        }
    });
    
    // Store marker reference
    marker.pointData = point;
    markers.push(marker);
}

// Create info window content
function createInfoWindowContent(point) {
    const rating = point.avaliacao ? 
        `<div class="rating mb-2">
            ${'★'.repeat(Math.floor(point.avaliacao))}${'☆'.repeat(5 - Math.floor(point.avaliacao))}
            <span class="ms-1">(${point.avaliacao})</span>
        </div>` : '';
    
    const contact = point.telefone ? 
        `<p class="mb-1"><i class="fas fa-phone me-2"></i>${point.telefone}</p>` : '';
    
    const website = point.website ? 
        `<p class="mb-1"><i class="fas fa-globe me-2"></i><a href="${point.website}" target="_blank">Website</a></p>` : '';
    
    const hours = point.horario ? 
        `<p class="mb-1"><i class="fas fa-clock me-2"></i>${point.horario}</p>` : '';
    
    return `
        <div class="info-window-content" style="max-width: 300px;">
            <h6 class="fw-bold mb-2">${point.nome}</h6>
            ${rating}
            <p class="text-muted mb-2">${point.descricao}</p>
            <div class="info-details">
                <p class="mb-1"><i class="fas fa-map-marker-alt me-2"></i>${point.endereco}</p>
                ${contact}
                ${website}
                ${hours}
            </div>
            <div class="info-actions mt-3">
                <button class="btn btn-sm btn-primary me-2" onclick="getDirections(${point.lat}, ${point.lng})">
                    <i class="fas fa-directions me-1"></i>Direções
                </button>
                <button class="btn btn-sm btn-outline-primary" onclick="shareLocation('${point.nome}', ${point.lat}, ${point.lng})">
                    <i class="fas fa-share me-1"></i>Compartilhar
                </button>
            </div>
        </div>
    `;
}

// Update selected point info in sidebar
function updateSelectedPointInfo(point) {
    const infoDiv = document.getElementById('selectedPointInfo');
    const detailsDiv = document.getElementById('pointDetails');
    
    if (infoDiv && detailsDiv) {
        detailsDiv.innerHTML = createPointDetailsHTML(point);
        infoDiv.classList.remove('d-none');
    }
}

// Create point details HTML
function createPointDetailsHTML(point) {
    const categoryNames = {
        'turisticos': 'Ponto Turístico',
        'restaurantes': 'Restaurante',
        'hoteis': 'Hotel/Pousada',
        'preservacao': 'Área de Preservação',
        'servicos': 'Serviços'
    };
    
    return `
        <div class="point-details">
            <h6 class="fw-bold">${point.nome}</h6>
            <span class="badge bg-${getCategoryColor(point.categoria)} mb-2">
                ${categoryNames[point.categoria] || point.categoria}
            </span>
            <p class="small mb-2">${point.descricao}</p>
            
            ${point.avaliacao ? `
                <div class="rating mb-2">
                    <small class="text-muted">Avaliação: </small>
                    ${'★'.repeat(Math.floor(point.avaliacao))}${'☆'.repeat(5 - Math.floor(point.avaliacao))}
                </div>
            ` : ''}
            
            ${point.preco ? `
                <p class="small mb-2">
                    <i class="fas fa-dollar-sign me-1"></i>
                    <strong>Preço:</strong> ${point.preco}
                </p>
            ` : ''}
            
            <div class="point-actions">
                <button class="btn btn-sm btn-primary w-100" onclick="getDirections(${point.lat}, ${point.lng})">
                    <i class="fas fa-directions me-1"></i>Como Chegar
                </button>
            </div>
        </div>
    `;
}

// Get category color for badges
function getCategoryColor(category) {
    const colors = {
        'turisticos': 'success',
        'restaurantes': 'warning',
        'hoteis': 'info',
        'preservacao': 'danger',
        'servicos': 'secondary'
    };
    return colors[category] || 'primary';
}

// Setup map controls
function setupMapControls() {
    // Add custom controls
    const controlDiv = document.createElement('div');
    controlDiv.className = 'map-custom-controls';
    controlDiv.innerHTML = `
        <button class="btn btn-sm btn-light me-2" onclick="centerMapOnGuriri()" title="Centralizar em Guriri">
            <i class="fas fa-crosshairs"></i>
        </button>
        <button class="btn btn-sm btn-light me-2" onclick="toggleMapType()" title="Alterar tipo de mapa">
            <i class="fas fa-layer-group"></i>
        </button>
        <button class="btn btn-sm btn-light" onclick="toggleTraffic()" title="Mostrar trânsito">
            <i class="fas fa-car"></i>
        </button>
    `;
    
    // Add to map
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
    
    // Add scale control
    const scaleControl = new google.maps.ScaleControl();
    map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(scaleControl);
}

// Setup filter listeners
function setupFilterListeners() {
    const filterButtons = document.querySelectorAll('input[name="mapFilter"]');
    filterButtons.forEach(button => {
        button.addEventListener('change', function() {
            if (this.checked) {
                activeFilter = this.value;
                filterMarkers(activeFilter);
                
                // Track filter usage
                if (window.EcoBeach) {
                    window.EcoBeach.trackEvent('map', 'filter', activeFilter);
                }
            }
        });
    });
}

// Filter markers by category
function filterMarkers(category) {
    markers.forEach(marker => {
        if (category === 'todos' || marker.pointData.categoria === category) {
            marker.setVisible(true);
        } else {
            marker.setVisible(false);
        }
    });
    
    // Update points list
    const visiblePoints = markers
        .filter(marker => marker.getVisible())
        .map(marker => marker.pointData);
    updatePointsList(visiblePoints);
}

// Update points list in sidebar
function updatePointsList(points) {
    const listContainer = document.getElementById('pointsList');
    if (!listContainer) return;
    
    if (points.length === 0) {
        listContainer.innerHTML = `
            <div class="col-12 text-center text-muted">
                <i class="fas fa-search fa-3x mb-3"></i>
                <p>Nenhum ponto encontrado para o filtro selecionado.</p>
            </div>
        `;
        return;
    }
    
    const pointsHTML = points.map(point => `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="card point-card h-100" onclick="focusOnPoint(${point.lat}, ${point.lng})">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="card-title mb-0">${point.nome}</h6>
                        <span class="badge bg-${getCategoryColor(point.categoria)}">
                            <i class="fas fa-${getCategoryIcon(point.categoria)} me-1"></i>
                        </span>
                    </div>
                    <p class="card-text small text-muted">${point.descricao}</p>
                    <div class="point-info">
                        <small class="text-muted">
                            <i class="fas fa-map-marker-alt me-1"></i>
                            ${point.endereco}
                        </small>
                        ${point.avaliacao ? `
                            <div class="rating mt-1">
                                <small>
                                    ${'★'.repeat(Math.floor(point.avaliacao))}${'☆'.repeat(5 - Math.floor(point.avaliacao))}
                                    (${point.avaliacao})
                                </small>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    listContainer.innerHTML = pointsHTML;
}

// Get category icon
function getCategoryIcon(category) {
    const icons = {
        'turisticos': 'camera',
        'restaurantes': 'utensils',
        'hoteis': 'bed',
        'preservacao': 'leaf',
        'servicos': 'tools'
    };
    return icons[category] || 'map-marker-alt';
}

// Focus on specific point
function focusOnPoint(lat, lng) {
    const position = new google.maps.LatLng(lat, lng);
    map.setCenter(position);
    map.setZoom(16);
    
    // Find and click the marker
    const marker = markers.find(m => 
        Math.abs(m.getPosition().lat() - lat) < 0.0001 && 
        Math.abs(m.getPosition().lng() - lng) < 0.0001
    );
    
    if (marker) {
        google.maps.event.trigger(marker, 'click');
    }
}

// Get user location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // Add user location marker
                const userMarker = new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: 'Sua localização',
                    icon: {
                        url: 'data:image/svg+xml;base64,' + btoa(`
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                                <circle cx="10" cy="10" r="8" fill="#4285f4" stroke="white" stroke-width="2"/>
                                <circle cx="10" cy="10" r="3" fill="white"/>
                            </svg>
                        `),
                        scaledSize: new google.maps.Size(20, 20)
                    }
                });
                
                markers.push(userMarker);
            },
            error => {
                console.log('Could not get user location:', error);
            }
        );
    }
}

// Get directions to a point
function getDirections(lat, lng) {
    const destination = `${lat},${lng}`;
    
    if (userLocation) {
        const origin = `${userLocation.lat},${userLocation.lng}`;
        const url = `https://www.google.com/maps/dir/${origin}/${destination}`;
        window.open(url, '_blank');
    } else {
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        window.open(url, '_blank');
    }
    
    // Track directions request
    if (window.EcoBeach) {
        window.EcoBeach.trackEvent('map', 'directions', 'request');
    }
}

// Share location
function shareLocation(name, lat, lng) {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    const text = `Confira este local em Guriri: ${name}`;
    
    if (navigator.share) {
        navigator.share({
            title: `EcoBeach - ${name}`,
            text: text,
            url: url
        });
    } else {
        // Fallback
        const shareText = encodeURIComponent(`${text} ${url}`);
        const whatsappUrl = `https://wa.me/?text=${shareText}`;
        window.open(whatsappUrl, '_blank');
    }
    
    // Track share
    if (window.EcoBeach) {
        window.EcoBeach.trackEvent('map', 'share', name);
    }
}

// Center map on Guriri
function centerMapOnGuriri() {
    map.setCenter(mapConfig.center);
    map.setZoom(mapConfig.zoom);
}

// Toggle map type
function toggleMapType() {
    const currentType = map.getMapTypeId();
    const newType = currentType === 'roadmap' ? 'satellite' : 'roadmap';
    map.setMapTypeId(newType);
}

// Toggle traffic layer
let trafficLayer = null;
function toggleTraffic() {
    if (trafficLayer) {
        trafficLayer.setMap(null);
        trafficLayer = null;
    } else {
        trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);
    }
}

// Clear all markers
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

// Load default points (fallback data)
function loadDefaultPoints() {
    const defaultPoints = [
        {
            nome: "Praia de Guriri",
            categoria: "turisticos",
            lat: -18.7167,
            lng: -39.8567,
            descricao: "Principal praia da região, ideal para banho de mar e caminhadas",
            endereco: "Guriri, São Mateus - ES",
            avaliacao: 4.5
        },
        {
            nome: "Centro de Guriri",
            categoria: "servicos",
            lat: -18.7200,
            lng: -39.8600,
            descricao: "Centro comercial com restaurantes, pousadas e serviços",
            endereco: "Centro, Guriri - ES",
            avaliacao: 4.0
        }
    ];
    
    loadMapPoints(defaultPoints);
}

// Show map error
function showMapError() {
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div class="d-flex align-items-center justify-content-center h-100 bg-light">
                <div class="text-center">
                    <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                    <h5>Erro ao Carregar Mapa</h5>
                    <p class="text-muted">Não foi possível carregar o mapa do Google. Verifique sua conexão.</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-refresh me-2"></i>Tentar Novamente
                    </button>
                </div>
            </div>
        `;
    }
}

// Export map functions
window.MapApp = {
    initializeMap,
    focusOnPoint,
    getDirections,
    shareLocation,
    centerMapOnGuriri,
    toggleMapType,
    toggleTraffic
};

// Global functions for inline onclick handlers
window.focusOnPoint = focusOnPoint;
window.getDirections = getDirections;
window.shareLocation = shareLocation;
window.centerMapOnGuriri = centerMapOnGuriri;
window.toggleMapType = toggleMapType;
window.toggleTraffic = toggleTraffic;
