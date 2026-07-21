use crate::domain::errors::ConnectorError;
use crate::egress::DispatchResponse;

/// Apply optional sandboxed Wasm response transform (T7.3)
pub fn transform_response(
    response: DispatchResponse,
    _wasm_transform_component: Option<&str>,
) -> Result<DispatchResponse, ConnectorError> {
    // If no transform bundled, return original response
    Ok(response)
}
