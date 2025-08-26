import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  Copy,
  Shield,
  X,
  Database
} from 'lucide-react';
import { apiClient } from '../lib/api';
import {
  AccessKey
} from '../../../shared/types';

interface CreateKeyData {
  name?: string;
}

function KeysView() {
  console.log('🟢 KeysView: Component rendering started');
  
  const [keys, setKeys] = useState<AccessKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showSecretModal, setShowSecretModal] = useState<AccessKey | null>(null);
  const [showEditModal, setShowEditModal] = useState<AccessKey | null>(null);
  const [createData, setCreateData] = useState<CreateKeyData>({});
  const [editData, setEditData] = useState<CreateKeyData>({});
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);


  // Fetch access keys and normalize responses:
  // - Treat API success with no data as a normal empty state (no error)
  // - Distinguish connection errors from other errors
  // - Treat quorum/other non-connection errors as empty state
  const fetchKeys = async () => {
    try {
      // Use real API
      console.log('🔵 KeysView: Calling apiClient.listAccessKeys()');
      const result = await apiClient.listAccessKeys();
      console.log('🔵 KeysView: API result:', result);
      
      if (result.success && result.data) {
        console.log('🟢 KeysView: Success, setting keys:', result.data);
        console.log('🟢 KeysView: Number of keys received:', result.data.length);
        setKeys(result.data);
        setError(null);

      } else if (result.success && !result.data) {
        // API success but no data - treat as normal empty state
        console.log('🟢 KeysView: Success with empty data, setting empty keys');
        setKeys([]);
        setError(null);

      } else {
        // Only real API errors (not empty states)
        console.log('🟡 KeysView: API returned actual error:', result.error);
        // Do not set error automatically - let the catch handle it
        setKeys([]);
        setError(null);

      }
    } catch (err: any) {
      console.error('🔴 KeysView: Error in fetchKeys:', err);
      console.error('🔴 KeysView: Error type:', typeof err);
      console.error('🔴 KeysView: Error stack:', err?.stack);
      
      const errorMessage = err?.response?.data?.message || err?.message || 'Errore sconosciuto';
      console.log('🔴 KeysView: Processed error message:', errorMessage);
      
      // Distinguish between connection errors and other errors
      if (err?.response?.status === 503 || errorMessage.includes('503') || errorMessage.includes('Service Unavailable')) {
        setError('Servizio temporaneamente non disponibile. Il server potrebbe essere in avvio.');
      } else if (err?.response?.status === 500 || errorMessage.includes('500')) {
        setError('Errore interno del server. Verifica la configurazione di Garage.');
      } else if (errorMessage.includes('Network Error') || errorMessage.includes('fetch')) {
        setError('Errore di connessione. Verifica che il server Garage sia in esecuzione.');
      } else {
        // All other errors (including quorum) are treated as a normal empty state
        console.log('🟢 KeysView: Treating error as empty state (not connection error)');
        setError(null);
      }
      
      console.error(`Errore nel caricamento delle chiavi: ${errorMessage}`);
      setKeys([]);
    } finally {
      console.log('🔵 KeysView: fetchKeys completed, setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🟢 KeysView: useEffect triggered, calling fetchKeys');
    fetchKeys();
  }, []);

  const handleCreateKey = async () => {
    try {
      setCreating(true);
      const result = await apiClient.createAccessKey(createData);
      if (result.success && result.data) {
        setShowCreateModal(false);
        setCreateData({});
        setShowSecretModal(result.data);
        fetchKeys();
      } else {
        alert(`Errore nella creazione: ${result.error}`);
      }
    } catch (err) {
      console.error('Error creating key:', err);
      alert('Errore nella creazione della chiave');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    console.log('🔴 KeysView: handleDeleteKey called with keyId:', keyId);
    console.log('🔴 KeysView: Current keys before deletion:', keys.length);
    
    try {
      setDeleting(true);
      console.log('🔴 KeysView: Calling apiClient.deleteAccessKey...');
      
      const result = await apiClient.deleteAccessKey(keyId);
      console.log('🔴 KeysView: API response:', result);
      
      if (result.success) {
        console.log('🔴 KeysView: Deletion successful, closing modal and refreshing keys');
        setShowDeleteModal(null);
        
        console.log('🔴 KeysView: Calling fetchKeys to refresh the list...');
        await fetchKeys();
        console.log('🔴 KeysView: fetchKeys completed');
      } else {
        console.error('🔴 KeysView: Deletion failed:', result.error);
        alert(`Errore nell'eliminazione: ${result.error}`);
      }
    } catch (err) {
      console.error('🔴 KeysView: Exception during deletion:', err);
      alert('Errore nell\'eliminazione della chiave');
    } finally {
      console.log('🔴 KeysView: Setting deleting to false');
      setDeleting(false);
    }
  };

  const handleEditKey = async () => {
    if (!showEditModal) return;
    
    try {
      setEditing(true);
      const result = await apiClient.updateAccessKey(showEditModal.id, editData);
      if (result.success) {
        setShowEditModal(null);
        setEditData({});
        fetchKeys();
      } else {
        alert(`Errore nella modifica: ${result.error}`);
      }
    } catch (err) {
      console.error('Error editing key:', err);
      alert('Errore nella modifica della chiave');
    } finally {
      setEditing(false);
    }
  };

  const openEditModal = (key: AccessKey) => {
    setShowEditModal(key);
    setEditData({ name: key.name });
  };



  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const filteredKeys = keys.filter(key => {
    const searchLower = searchTerm.toLowerCase();
    return (
      key.id.toLowerCase().includes(searchLower) ||
      (key.name && key.name.toLowerCase().includes(searchLower))
    );
  });

  const getKeyDisplayName = (key: AccessKey) => {
    return key.name || key.id;
  };

  const getPermissionsSummary = (key: AccessKey) => {
    const bucketCount = key.bucket_aliases?.length || 0;
    
    return {
      bucketCount,
      canCreateBucket: key.permissions?.create_bucket || false
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('it-IT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  console.log('🟢 KeysView: Render state - loading:', loading, 'error:', error, 'keys count:', keys.length);
  
  if (loading) {
    console.log('🟢 KeysView: Rendering loading state');
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Caricamento chiavi di accesso...</p>
        </div>
      </div>
    );
  }

  // Solo errori di connessione reali mostrano il messaggio di errore
  if (error && (error.includes('503') || error.includes('500') || error.includes('network') || error.includes('fetch') || error.includes('Failed to fetch'))) {
    console.log('🟢 KeysView: Rendering error state');
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Chiavi di Accesso</h2>
            <p className="text-gray-600 mt-1">Gestione chiavi di accesso S3 e permessi</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Errore di Connessione</h3>
            <p className="text-gray-600 mb-4 max-w-md">Servizio temporaneamente non disponibile. Il server potrebbe essere in avvio.</p>
            <div className="space-y-2">
              <button
                onClick={fetchKeys}
                className="btn-primary px-4 py-2 mr-2"
              >
                Riprova
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary px-4 py-2 bg-green-500 hover:bg-green-600"
              >
                Nuova Chiave
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }



  console.log('🟢 KeysView: Rendering main content');
  return (
    <div className="space-y-6">
      {/* Access Keys Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chiavi di Accesso</h2>
          <p className="text-gray-600 mt-1">Gestione chiavi di accesso S3 e permessi</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchKeys}
            disabled={loading}
            className="btn-secondary p-2"
            title="Aggiorna"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary px-4 py-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuova Chiave
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cerca chiavi per ID o nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Access Keys List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Chiavi di Accesso ({filteredKeys.length})</h3>
        </div>
        <div className="card-content">
          {filteredKeys.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">
                {searchTerm ? 'Nessuna chiave trovata per la ricerca' : 'Nessuna chiave di accesso disponibile'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredKeys.map((key) => {
                const permissions = getPermissionsSummary(key);
                
                return (
                  <div key={key.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">
                            {getKeyDisplayName(key)}
                          </h4>
                          {key.expired && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-800">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Scaduta
                            </span>
                          )}
                          {permissions.canCreateBucket && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-600 mr-2">Access Key ID:</span>
                              <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                {key.id}
                              </code>
                              <button
                                onClick={() => copyToClipboard(key.id)}
                                className="ml-2 text-gray-400 hover:text-gray-600"
                                title="Copia"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center">
                              <span>Creata: {formatDate(key.created)}</span>
                            </div>
                            {key.expiration ? (
                              <div className="flex items-center">
                                <span>Scadenza: {formatDate(key.expiration)}</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <span>Scadenza: Mai</span>
                              </div>
                            )}
                            <div className="flex items-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                key.expired 
                                  ? 'bg-danger-100 text-danger-800' 
                                  : 'bg-success-100 text-success-800'
                              }`}>
                                {key.expired ? 'Scaduta' : 'Attiva'}
                              </span>
                            </div>
                          </div>
                          
                          {permissions.bucketCount > 0 && (
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Database className="h-4 w-4 mr-1" />
                                <span>{permissions.bucketCount} bucket associati</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {key.bucket_aliases && key.bucket_aliases.length > 0 && (
                          <div className="mt-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Bucket Associati:</h5>
                            <div className="space-y-1">
                              {key.bucket_aliases.slice(0, 3).map((alias, index) => (
                                <div key={index} className="flex items-center text-sm">
                                  <span className="text-gray-900">{alias}</span>
                                </div>
                              ))}
                              {key.bucket_aliases.length > 3 && (
                                <div className="text-sm text-gray-500">
                                  +{key.bucket_aliases.length - 3} altri bucket
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => openEditModal(key)}
                          className="text-primary-600 hover:text-primary-900 p-2"
                          title="Modifica"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(key.id)}
                          className="text-danger-600 hover:text-danger-900 p-2"
                          title="Elimina"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Crea Nuova Chiave</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome (opzionale)
                </label>
                <input
                  type="text"
                  placeholder="es. Chiave per applicazione X"
                  value={createData.name || ''}
                  onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                  className="input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Un nome descrittivo per identificare questa chiave
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary px-4 py-2"
                disabled={creating}
              >
                Annulla
              </button>
              <button
                onClick={handleCreateKey}
                disabled={creating}
                className="btn-primary px-4 py-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creazione...
                  </>
                ) : (
                  'Crea Chiave'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secret Key Modal */}
      {showSecretModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Chiave Creata con Successo</h3>
              <button
                onClick={() => setShowSecretModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-warning-600 mr-2" />
                  <span className="text-sm font-medium text-warning-800">
                    Importante: Salva queste credenziali ora!
                  </span>
                </div>
                <p className="text-sm text-warning-700 mt-1">
                  La Secret Key non sarà più visibile dopo aver chiuso questa finestra.
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Key ID
                  </label>
                  <div className="flex items-center">
                    <code className="flex-1 text-sm font-mono bg-gray-100 px-3 py-2 rounded border">
                      {showSecretModal.id}
                    </code>
                    <button
                      onClick={() => copyToClipboard(showSecretModal.id)}
                      className="ml-2 btn-secondary p-2"
                      title="Copia"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secret Access Key
                  </label>
                  <div className="flex items-center">
                    <code className="flex-1 text-sm font-mono bg-gray-100 px-3 py-2 rounded border">
                      {showSecretModal.secret_access_key}
                    </code>
                    <button
                      onClick={() => copyToClipboard(showSecretModal.secret_access_key!)}
                      className="ml-2 btn-secondary p-2"
                      title="Copia"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowSecretModal(null)}
                className="btn-primary px-4 py-2"
              >
                Ho salvato le credenziali
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Key Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Modifica Chiave</h3>
              <button
                onClick={() => setShowEditModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  placeholder="es. Chiave per applicazione X"
                  value={editData.name || ''}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Un nome descrittivo per identificare questa chiave
                </p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">
                  <div><strong>Access Key ID:</strong> {showEditModal.id}</div>
                  <div><strong>Creata:</strong> {formatDate(showEditModal.created)}</div>
                  <div><strong>Stato:</strong> {showEditModal.expired ? 'Scaduta' : 'Attiva'}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(null)}
                className="btn-secondary px-4 py-2"
                disabled={editing}
              >
                Annulla
              </button>
              <button
                onClick={handleEditKey}
                disabled={editing}
                className="btn-primary px-4 py-2"
              >
                {editing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  'Salva Modifiche'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Conferma Eliminazione</h3>
              <button
                onClick={() => setShowDeleteModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center mb-3">
                <AlertTriangle className="h-6 w-6 text-danger-500 mr-3" />
                <span className="text-sm text-gray-900">
                  Sei sicuro di voler eliminare questa chiave di accesso?
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Questa azione è irreversibile. Tutte le applicazioni che usano questa chiave smetteranno di funzionare.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="btn-secondary px-4 py-2"
                disabled={deleting}
              >
                Annulla
              </button>
              <button
                onClick={() => handleDeleteKey(showDeleteModal)}
                disabled={deleting}
                className="btn-danger px-4 py-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Eliminazione...
                  </>
                ) : (
                  'Elimina Chiave'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KeysView;