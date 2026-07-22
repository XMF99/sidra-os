//! Marketplace Catalogue (M14)
//!
//! Ref: IMPLEMENTATION_PLAN.md T3.2

use super::publish::PublishedListing;
use std::collections::HashMap;

#[derive(Default)]
pub struct MarketplaceCatalogue {
    pub listings: HashMap<String, PublishedListing>,
}

impl MarketplaceCatalogue {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn list_listings(&self) -> Vec<PublishedListing> {
        self.listings.values().cloned().collect()
    }

    pub fn listing_detail(&self, pack_id: &str) -> Option<PublishedListing> {
        self.listings.get(pack_id).cloned()
    }
}
